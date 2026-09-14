-- ============================================================
-- Schema SQL cho Supabase PostgreSQL — Mẫnthợtóc Landing Page & Booking MVP
-- Chạy script này trong Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. Xóa bảng cũ để làm sạch dữ liệu test
DROP TABLE IF EXISTS public.bookings CASCADE;

-- 2. Tạo bảng bookings mới với UNIQUE (phone)
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    note TEXT
);

-- 3. Tạo Index tối ưu truy vấn theo sđt và ngày
CREATE INDEX idx_bookings_phone ON public.bookings (phone);
CREATE INDEX idx_bookings_date ON public.bookings (booking_date);

-- 4. Cấu hình Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Cho phép đọc công khai
CREATE POLICY "Allow public select bookings" ON public.bookings
    FOR SELECT USING (true);

-- Policy 2: Cho phép tạo booking mới công khai
CREATE POLICY "Allow public insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Policy 3: Cho phép cập nhật booking theo sđt
CREATE POLICY "Allow public update bookings" ON public.bookings
    FOR UPDATE USING (true);
