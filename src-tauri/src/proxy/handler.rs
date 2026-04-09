use std::sync::Arc;
use std::time::Instant;

use async_trait::async_trait;
use chrono::Utc;
use hudsucker::hyper::{Body, Request, Response};
use hudsucker::{HttpContext, HttpHandler, RequestOrResponse};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

use crate::models::{CapturedRequest, RequestState, RequestSummary, ResponseUpdate};
use crate::state::AppState;

fn extract_content_type(headers: &http::HeaderMap) -> Option<String> {
    headers
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.split(';').next().unwrap_or(v).trim().to_string())
}

fn headers_to_vec(headers: &http::HeaderMap) -> Vec<(String, String)> {
    headers
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect()
}

#[derive(Clone)]
pub struct ProxyHandler {
    pub state: Arc<AppState>,
    pub app: AppHandle,
    pending_id: Option<String>,
    pending_start: Option<Instant>,
}

impl ProxyHandler {
    pub fn new(state: Arc<AppState>, app: AppHandle) -> Self {
        Self { state, app, pending_id: None, pending_start: None }
    }
}

#[async_trait]
impl HttpHandler for ProxyHandler {
    async fn handle_request(
        &mut self,
        _ctx: &HttpContext,
        req: Request<Body>,
    ) -> RequestOrResponse {
        let id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().to_rfc3339();

        let method = req.method().to_string();
        let uri = req.uri().clone();
        let scheme = uri.scheme_str().unwrap_or("http").to_string();
        let host = uri
            .host()
            .or_else(|| req.headers().get("host").and_then(|v| v.to_str().ok()))
            .unwrap_or("unknown")
            .to_string();
        let path = uri.path_and_query().map(|p| p.to_string()).unwrap_or_else(|| "/".to_string());
        let url = format!("{scheme}://{host}{path}");

        let request_headers = headers_to_vec(req.headers());
        let request_content_type = extract_content_type(req.headers());

        let (parts, body) = req.into_parts();
        let body_bytes = hudsucker::hyper::body::to_bytes(body).await.unwrap_or_default();
        let request_body_size = body_bytes.len() as u64;

        if request_body_size <= 10 * 1024 * 1024 {
            self.state.request_bodies.insert(id.clone(), body_bytes.to_vec());
        }

        let captured = CapturedRequest {
            id: id.clone(),
            timestamp,
            method,
            url,
            host,
            scheme,
            path,
            request_headers,
            request_body_size,
            request_content_type,
            status_code: None,
            response_headers: None,
            response_body_size: None,
            response_content_type: None,
            duration_ms: None,
            tls_version: None,
            state: RequestState::Pending,
            error: None,
        };

        let summary = RequestSummary::from(&captured);
        self.state.requests.insert(id.clone(), captured);
        if let Ok(mut order) = self.state.request_order.lock() {
            order.push(id.clone());
        }

        self.pending_id = Some(id);
        self.pending_start = Some(Instant::now());

        let _ = self.app.emit("proxy-request", &summary);

        RequestOrResponse::Request(Request::from_parts(parts, Body::from(body_bytes)))
    }

    async fn handle_response(
        &mut self,
        _ctx: &HttpContext,
        res: Response<Body>,
    ) -> Response<Body> {
        if let Some(id) = self.pending_id.take() {
            let duration_ms = self.pending_start.take().map(|s| s.elapsed().as_millis() as u64);

            let status_code = res.status().as_u16();
            let response_headers = headers_to_vec(res.headers());
            let response_content_type = extract_content_type(res.headers());

            let (parts, body) = res.into_parts();
            let body_bytes = hudsucker::hyper::body::to_bytes(body).await.unwrap_or_default();
            let response_body_size = body_bytes.len() as u64;

            if response_body_size <= 10 * 1024 * 1024 {
                self.state.response_bodies.insert(id.clone(), body_bytes.to_vec());
            }

            let update = ResponseUpdate {
                id: id.clone(),
                status_code: Some(status_code),
                response_content_type: response_content_type.clone(),
                response_body_size: Some(response_body_size),
                duration_ms,
                state: RequestState::Complete,
                error: None,
            };

            if let Some(mut entry) = self.state.requests.get_mut(&id) {
                entry.status_code = Some(status_code);
                entry.response_headers = Some(response_headers);
                entry.response_content_type = response_content_type;
                entry.response_body_size = Some(response_body_size);
                entry.duration_ms = duration_ms;
                entry.state = RequestState::Complete;
            }

            let _ = self.app.emit("proxy-response", &update);

            return Response::from_parts(parts, Body::from(body_bytes));
        }

        res
    }
}
