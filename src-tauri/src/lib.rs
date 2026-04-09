mod commands;
mod models;
mod proxy;
mod state;

use std::sync::Arc;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(AppState::new());

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::start_proxy,
            commands::stop_proxy,
            commands::get_proxy_status,
            commands::get_requests,
            commands::get_request_detail,
            commands::get_request_body,
            commands::get_response_body,
            commands::clear_requests,
            commands::export_as_curl,
            commands::generate_ca,
            commands::install_ca,
            commands::get_ca_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ZProxy");
}
