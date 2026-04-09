use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RequestState {
    Pending,
    Complete,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapturedRequest {
    pub id: String,
    pub timestamp: String,
    pub method: String,
    pub url: String,
    pub host: String,
    pub scheme: String,
    pub path: String,
    pub request_headers: Vec<(String, String)>,
    pub request_body_size: u64,
    pub request_content_type: Option<String>,
    pub status_code: Option<u16>,
    pub response_headers: Option<Vec<(String, String)>>,
    pub response_body_size: Option<u64>,
    pub response_content_type: Option<String>,
    pub duration_ms: Option<u64>,
    pub tls_version: Option<String>,
    pub state: RequestState,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestSummary {
    pub id: String,
    pub timestamp: String,
    pub method: String,
    pub host: String,
    pub path: String,
    pub scheme: String,
    pub status_code: Option<u16>,
    pub request_content_type: Option<String>,
    pub response_content_type: Option<String>,
    pub request_body_size: u64,
    pub response_body_size: Option<u64>,
    pub duration_ms: Option<u64>,
    pub state: RequestState,
}

impl From<&CapturedRequest> for RequestSummary {
    fn from(r: &CapturedRequest) -> Self {
        RequestSummary {
            id: r.id.clone(),
            timestamp: r.timestamp.clone(),
            method: r.method.clone(),
            host: r.host.clone(),
            path: r.path.clone(),
            scheme: r.scheme.clone(),
            status_code: r.status_code,
            request_content_type: r.request_content_type.clone(),
            response_content_type: r.response_content_type.clone(),
            request_body_size: r.request_body_size,
            response_body_size: r.response_body_size,
            duration_ms: r.duration_ms,
            state: r.state.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseUpdate {
    pub id: String,
    pub status_code: Option<u16>,
    pub response_content_type: Option<String>,
    pub response_body_size: Option<u64>,
    pub duration_ms: Option<u64>,
    pub state: RequestState,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyStatus {
    pub running: bool,
    pub port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaStatus {
    pub exists: bool,
    pub path: Option<String>,
}
