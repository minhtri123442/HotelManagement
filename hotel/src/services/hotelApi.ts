export async function getHotels() {
    const res = await fetch("http://localhost:5134/api/hotels");
    if (!res.ok) throw new Error("Không thể tải danh sách khách sạn");
    return res.json();
}

export async function searchHotels(keyword: string) {
    const res = await fetch(
        `http://localhost:5134/api/hotels/search?keyword=${encodeURIComponent(keyword)}`
    );
    return res.json();
}
