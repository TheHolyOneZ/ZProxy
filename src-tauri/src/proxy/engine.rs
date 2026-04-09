use std::net::SocketAddr;
use std::sync::Arc;

use hudsucker::certificate_authority::RcgenAuthority;
use hudsucker::rustls::{Certificate as RustlsCert, PrivateKey as RustlsKey};
use hudsucker::Proxy;
use tauri::{AppHandle, Emitter};
use tokio::sync::oneshot;

use super::cert::load_or_create_ca;
use super::handler::ProxyHandler;
use crate::state::AppState;

pub async fn start_proxy(
    port: u16,
    app: AppHandle,
    state: Arc<AppState>,
    app_data_dir: std::path::PathBuf,
) -> Result<oneshot::Sender<()>, String> {
    let ca_ctx = load_or_create_ca(&app_data_dir)?;

    let ca_cert = RustlsCert(ca_ctx.cert_der);
    let private_key = RustlsKey(ca_ctx.key_der);

    let ca = RcgenAuthority::new(private_key, ca_cert, 1_000)
        .map_err(|e| e.to_string())?;

    let handler = ProxyHandler::new(state, app.clone());
    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    let proxy = Proxy::builder()
        .with_addr(addr)
        .with_rustls_client()
        .with_ca(ca)
        .with_http_handler(handler)
        .build();

    let (tx, rx) = oneshot::channel::<()>();

    tokio::spawn(async move {
        proxy.start(async move { let _ = rx.await; }).await.ok();
    });

    let _ = app.emit("proxy-started", serde_json::json!({ "port": port }));

    Ok(tx)
}
