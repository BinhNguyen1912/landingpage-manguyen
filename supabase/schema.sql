-- ============================================================
-- Schema SQL cho Supabase PostgreSQL — Mẫnthợtóc Landing Page & Booking MVP
-- Chạy script này trong Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. Tạo bảng bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    note TEXT
);

-- 2. Tạo Index tối ưu truy vấn theo sđt và ngày
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings (phone);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (booking_date);

-- 3. Cấu hình Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop policy cũ nếu có
DROP POLICY IF EXISTS "Allow public select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update bookings" ON public.bookings;

-- Policy 1: Cho phép đọc công khai
CREATE POLICY "Allow public select bookings" ON public.bookings
    FOR SELECT USING (true);

-- Policy 2: Cho phép tạo booking mới công khai
CREATE POLICY "Allow public insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Policy 3: Cho phép cập nhật booking theo sđt
CREATE POLICY "Allow public update bookings" ON public.bookings
    FOR UPDATE USING (true);
