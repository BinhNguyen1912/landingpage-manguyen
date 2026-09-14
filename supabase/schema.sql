-- ============================================================
-- Schema SQL cho Supabase PostgreSQL — Mẫnthợtóc Landing Page & Booking MVP
-- Chạy script này trong Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. Tạo bảng bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    note TEXT,
    CONSTRAINT unique_booking_slot UNIQUE (booking_date, booking_time)
);

-- 2. Tạo Index tối ưu cho truy vấn availability theo ngày
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (booking_date);

-- 3. Cấu hình Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop cũ nếu re-run script
DROP POLICY IF EXISTS "Allow public select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;

-- Policy 1: Cho phép đọc công khai (để frontend check slot đã được đặt)
CREATE POLICY "Allow public select bookings" ON public.bookings
    FOR SELECT USING (true);

-- Policy 2: Cho phép tạo booking mới công khai
CREATE POLICY "Allow public insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);
