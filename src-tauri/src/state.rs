use dashmap::DashMap;
use std::sync::{
    atomic::{AtomicBool, AtomicU16},
    Mutex,
};
use tokio::sync::oneshot;

use crate::models::CapturedRequest;

pub struct AppState {
    pub requests: DashMap<String, CapturedRequest>,
    pub request_bodies: DashMap<String, Vec<u8>>,
    pub response_bodies: DashMap<String, Vec<u8>>,
    pub request_order: Mutex<Vec<String>>,
    pub proxy_running: AtomicBool,
    pub proxy_port: AtomicU16,
    pub proxy_shutdown: Mutex<Option<oneshot::Sender<()>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            requests: DashMap::new(),
            request_bodies: DashMap::new(),
            response_bodies: DashMap::new(),
            request_order: Mutex::new(Vec::new()),
            proxy_running: AtomicBool::new(false),
            proxy_port: AtomicU16::new(8080),
            proxy_shutdown: Mutex::new(None),
        }
    }
}
