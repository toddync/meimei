// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
use tauri::window::Color;

#[tauri::command]
async fn open_window(app: tauri::AppHandle, label: String) {
    tauri::WebviewWindowBuilder::new(&app, label, tauri::WebviewUrl::App("index.html".into()))
        .background_color(Color(10, 10, 10, 1))
        .min_inner_size(400.0, 40.0)
        .inner_size(1120.0, 630.0)
        .decorations(false)
        .focused(true)
        .center()
        .build()
        .unwrap();
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
