# Hệ Thống Quản Lý Đặt Phòng Khách Sạn (dtc245160055_TKQTHTPM_De06)

> **Môn học:** Thiết kế & Quản trị Hạ tầng Phần mềm (TKQTHTPM)  
> **Đề tài:** Đề 06 - Triển khai hệ thống Đặt phòng Khách sạn  
> **Trường:** Trường Đại học Công nghệ Thông tin & Truyền thông (ICTU) - Đại học Thái Nguyên  
> **Người thực hiện:** Nguyễn Đức Hiếu  
> **Mã sinh viên:** `DTC245160055`  
> **Tài khoản GitHub:** `dtc245160055-creator`  
> **Kho lưu trữ GitHub:** https://github.com/dtc245160055-creator/dtc245160055_TKQTHTPM_De06.git  
> **Địa chỉ IP máy chủ:** `192.168.153.133`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Dành Cho Thành Viên & Giảng Viên)

Để chạy phiên bản mới nhất đã hoàn tất cấu hình Proxy SSL, giám sát tài nguyên Prometheus/Grafana, gom log tập trung Loki và Hardening bảo mật, vui lòng thực hiện các bước sau:

### Bước 1: Cập nhật mã nguồn mới nhất từ GitHub
```bash
git pull origin main
Bước 2: Thiết lập cấu hình biến môi trườngTạo file .env chứa thông tin kết nối CSDL và phân quyền nghiêm ngặt:Bashcat << 'ENV' > .env
POSTGRES_DB=hotel_db
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=hotel_password_secure
PGADMIN_DEFAULT_EMAIL=admin@hotel.com
PGADMIN_DEFAULT_PASSWORD=admin_password_secure
ENV

chmod 600 .env
Bước 3: Khởi chạy cụm dịch vụ bằng Docker ComposeBash# Tắt phiên bản cũ nếu đang chạy:
docker compose down

# Khởi chạy ngầm toàn bộ 11 container:
docker compose up -d
Bước 4: Kiểm tra trạng thái hoạt động của hệ thốngBashdocker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
🌐 Danh Mục Dịch Vụ & Địa Chỉ Truy CậpTruy cập trực tiếp trên máy chủ hoặc các thiết bị trong cùng mạng LAN / Wi-Fi (192.168.153.133):1. Giao diện Đặt phòng Khách sạn (HTTPS):Đường dẫn: https://192.168.153.133(Lưu ý: Bấm chọn "Nâng cao" -> "Tiếp tục truy cập" để bỏ qua cảnh báo chứng chỉ SSL tự ký).2. Giao diện Quản trị CSDL pgAdmin:Đường dẫn: https://192.168.153.133/pgadmin/Tài khoản: admin@hotel.com | Mật khẩu: admin_password_secure3. Bảng kiểm tra Prometheus Targets:Đường dẫn: http://192.168.153.133:9090/targetsTrạng thái kiểm tra: 4 endpoint (hotel-app, cadvisor, postgres-exporter, nginx-exporter) đều đạt State: UP màu xanh lá.4. Bảng điều khiển Giám sát Grafana:Đường dẫn: http://192.168.153.133:3001Tài khoản đăng nhập: admin | Mật khẩu: admin5. Endpoint kiểm tra sức khỏe Loki:Đường dẫn: http://192.168.153.133:3100/ready (Phản hồi: ready).🛠️ Danh Sách Các Thành Phần Hệ Thống (Stack Details)Dịch vụDocker ImageCổng ContainerCổng Host (Public)Mạng DockerChức năng chi tiếtnginx_proxynginx:alpine80, 44380, 443frontend_net, backend_netĐiểm tiếp nhận truy cập tập trung, mã hóa SSL HTTPS, áp dụng Security Headers.hotel_appBuild từ repo3000Không công khaibackend_netỨng dụng nghiệp vụ đặt phòng khách sạn (Node.js/Express).postgres_dbpostgres:15-alpine5432Không công khaibackend_netCSDL quan hệ lưu danh sách phòng và đơn đặt (hotel_db).pgadmin_tooldpage/pgadmin4:latest80Định tuyến /pgadminbackend_netQuản trị CSDL PostgreSQL qua giao diện đồ họa trình duyệt.prometheus_srvprom/prometheus:v2.48.090909090monitoring_netThu thập và lưu trữ time-series metrics định kỳ 5 giây.grafana_srvgrafana/grafana:10.2.030003001monitoring_netTrực quan hóa dashboard giám sát tài nguyên CPU, RAM và sức khỏe máy chủ.cadvisor_moncadvisor:v0.47.08080Không công khaimonitoring_netThu thập thông số tải CPU, RAM, I/O mạng từ Docker engine.postgres_exporterpostgres-exporter:v0.15.09187Không công khaibackend_net, monitoring_netTrích xuất thông số phiên và kết nối CSDL PostgreSQL sang Prometheus.nginx_exporternginx-prometheus-exporter:0.11.09113Không công khaimonitoring_netThu thập chỉ số kết nối active và số lượng request HTTP từ Nginx.lokigrafana/loki:2.9.231003100monitoring_netLưu trữ và lập chỉ mục nhật ký tập trung (Log Aggregation).promtailgrafana/promtail:2.9.2AgentDocker Socketmonitoring_netĐọc dữ liệu log từ Docker socket máy chủ chuyển tiếp về Loki.🔍 Truy Vấn Giám Sát & Phân Tích Nhật Ký Mẫu1. Truy vấn PromQL (Prometheus / Grafana)Giám sát dung lượng RAM thực tế tiêu thụ bởi các container:Đoạn mãsum(container_memory_usage_bytes{name=~".+"}) by (name)
Số lượng kết nối đang mở qua Nginx:Đoạn mãnginx_connections_active
2. Truy vấn LogQL (Grafana Explore -> Chọn nguồn Loki)Lọc toàn bộ log yêu cầu HTTP qua hệ thống:Đoạn mã{job="docker"} |= "HTTP"
Phát hiện mã phản hồi lỗi máy chủ HTTP 500:Đoạn mã{job="docker"} |= " 500 "
Tìm kiếm ngoại lệ và cảnh báo lỗi hệ thống:Đoạn mã{job="docker"} |~ "(?i)error|failed"
🛡️ Chính Sách Hardening & An Toàn Bảo MậtPhân tầng mạng (Network Isolation): Tách biệt thành 3 dải mạng Docker Bridge riêng biệt (frontend_net, backend_net, monitoring_net). Cổng CSDL 5432 bị cô lập hoàn toàn, không mở ra mạng ngoài.Nguyên tắc phân quyền tối thiểu (Least Privilege): Web app chỉ sử dụng tài khoản giới hạn hotel_user để kết nối và thao tác bảng, không dùng tài khoản quản trị tối cao postgres.Thiết lập Security Headers Nginx: Bật đồng bộ X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, X-XSS-Protection: 1; mode=block và Content-Security-Policy.Chống leo thang quyền hạn Container: Tất cả các container vận hành an toàn với cờ Privileged=false.📌 Lịch Sử Các Commit Dự Ándb337ef: feat: init hotel booking web app, postgres schema and readmee475785: feat(commit-1): configure nginx reverse proxy with self-signed SSL and security headersbea3e2c: feat(commit-2): setup prometheus, grafana dashboards, and exporters for container, db, and web732485b: Commit 3: Trien khai he thong quan ly log tap trung Loki va Promtailfeat(commit-4): hardening he thong va hoan tat bao cao
