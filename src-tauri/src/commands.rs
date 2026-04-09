use std::sync::{atomic::Ordering, Arc};

use tauri::{AppHandle, Emitter, Manager, State};

use crate::models::{CaStatus, CapturedRequest, ProxyStatus, RequestSummary};
use crate::proxy::{cert, engine};
use crate::state::AppState;

#[tauri::command]
pub async fn start_proxy(
    port: u16,
    app: AppHandle,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    if state.proxy_running.load(Ordering::Relaxed) {
        return Err("Proxy already running".to_string());
    }

    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let sender = engine::start_proxy(port, app.clone(), state.inner().clone(), app_data_dir).await?;

    state.proxy_running.store(true, Ordering::Relaxed);
    state.proxy_port.store(port, Ordering::Relaxed);

    if let Ok(mut lock) = state.proxy_shutdown.lock() {
        *lock = Some(sender);
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_proxy(
    app: AppHandle,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    if !state.proxy_running.load(Ordering::Relaxed) {
        return Err("Proxy not running".to_string());
    }

    if let Ok(mut lock) = state.proxy_shutdown.lock() {
        if let Some(sender) = lock.take() {
            let _ = sender.send(());
        }
    }

    state.proxy_running.store(false, Ordering::Relaxed);
    let _ = app.emit("proxy-stopped", serde_json::json!({}));

    Ok(())
}

#[tauri::command]
pub fn get_proxy_status(state: State<'_, Arc<AppState>>) -> ProxyStatus {
    ProxyStatus {
        running: state.proxy_running.load(Ordering::Relaxed),
        port: state.proxy_port.load(Ordering::Relaxed),
    }
}

#[tauri::command]
pub fn get_requests(state: State<'_, Arc<AppState>>) -> Vec<RequestSummary> {
    let order = state.request_order.lock().unwrap();
    order
        .iter()
        .filter_map(|id| state.requests.get(id).map(|r| RequestSummary::from(r.value())))
        .collect()
}

#[tauri::command]
pub fn get_request_detail(id: String, state: State<'_, Arc<AppState>>) -> Result<CapturedRequest, String> {
    state.requests.get(&id).map(|r| r.value().clone()).ok_or_else(|| format!("Request {id} not found"))
}

#[tauri::command]
pub fn get_request_body(id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<u8>, String> {
    state.request_bodies.get(&id).map(|b| b.value().clone()).ok_or_else(|| format!("Body for {id} not found"))
}

#[tauri::command]
pub fn get_response_body(id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<u8>, String> {
    state.response_bodies.get(&id).map(|b| b.value().clone()).ok_or_else(|| format!("Body for {id} not found"))
}

#[tauri::command]
pub fn clear_requests(state: State<'_, Arc<AppState>>) {
    state.requests.clear();
    state.request_bodies.clear();
    state.response_bodies.clear();
    if let Ok(mut order) = state.request_order.lock() {
        order.clear();
    }
}

#[tauri::command]
pub fn export_as_curl(id: String, state: State<'_, Arc<AppState>>) -> Result<String, String> {
    let req = state.requests.get(&id).ok_or_else(|| format!("Request {id} not found"))?;
    let mut parts = vec![format!("curl -X {}", req.method), format!("'{}'", req.url)];
    for (k, v) in &req.request_headers {
        let kl = k.to_lowercase();
        if kl == "host" || kl == "content-length" || kl == "transfer-encoding" { continue; }
        parts.push(format!("-H '{k}: {v}'"));
    }
    if let Some(body) = state.request_bodies.get(&id) {
        if !body.is_empty() {
            if let Ok(text) = std::str::from_utf8(&body) {
                let escaped = text.replace('\'', r"'\''");
                parts.push(format!("--data '{escaped}'"));
            }
        }
    }
    Ok(parts.join(" \\\n  "))
}

#[tauri::command]
pub fn generate_ca(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let ctx = cert::load_or_create_ca(&app_data_dir)?;
    Ok(ctx.cert_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn install_ca(app: AppHandle) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let ctx = cert::load_or_create_ca(&app_data_dir)?;
    cert::install_ca_windows(&ctx.cert_path)
}

#[tauri::command]
pub fn get_ca_status(app: AppHandle) -> Result<CaStatus, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let cert_path = cert::ca_cert_pem_path(&app_data_dir);
    Ok(CaStatus {
        exists: cert_path.exists(),
        path: if cert_path.exists() { Some(cert_path.to_string_lossy().to_string()) } else { None },
    })
}
