export const dealFields = [
    { name: 'username', type: 'text', note: "Họ tên khách hàng (Trong trường hợp số điện thoại hoặc email của khách đã tồn tại sẽ không sử dụng tham số này)" },
    { name: 'subject', type: 'text', note: 'Tiêu đề' },
    { name: 'phone', type: 'tel', note: 'Số điện thoại của khách hàng' },
    { name: 'email', type: 'email', note: 'Email của khách hàng' },
    { name: 'service_id', type: 'int', note: 'Dịch vụ tiếp nhận' },
    { name: 'group_id', type: 'int', note: 'ID bộ phận tiếp nhận' },
    { name: 'assignee_id', type: 'int', note: 'ID chuyên viên tiếp nhận' },
    { name: 'campaign_id', type: 'int', note: 'ID chiến dịch' },
    { name: 'pipeline_id', type: 'int', note: 'ID tiến trình (Mặc định theo cấu hình)' },
    { name: 'estimated_closed_date', type: 'DateTime', note: 'Dự kiến hoàn thành (Định dạng YYYY-MM-DD HH:mm:ss)' },
    { name: 'deal_label', type: 'array', note: 'Mảng ID label của deal dạng [1,2,3]', guide: `Ví dụ: 11,12` },
    { name: 'pipeline_stage_id', type: 'int', note: 'ID giai đoạn của tiến trình (mặc định là đầu giai đoạn)', guide: `Gắn các trạng thái trên nhanh với pipeline stage của CareSoft. Một stage có thể gắn nhiều trạng thái nhanh` },
    { name: 'custom_fields', type: 'array', note: 'Mảng custom_fields tương tự tạo ticket' },
    { name: 'probability', type: 'int', note: 'Tỉ lệ thành công (từ 0-100)' },
    { name: 'value', type: 'int', note: 'Giá trị đơn hàng (Số)' },
    {
        name: 'comment', type: 'text', note: 'Nội dung ghi chú', guide: `Ví dụ:
        Thông tin hoá đơn:
        Người mua: {{customerName}} - {{customerMobile}}
        Ngày mua hàng: {{createdDateTime}}
        Trạng thái: {{statusDescription}}
        Mô tả: {{description}}
        Danh sách mặt hàng:
        {{products}}
        Tổng tiền hàng: {{calcTotalMoney}}`
    },
    { name: 'comment.body', type: 'text', note: 'Nội dung comment', guide: 'Mục này là dùng cho cập nhật Deal' },
    {
        name: 'comment.is_public', type: 'int', note: `Trạng thái comment
        0: Ghi chú
        1: Public (VD: Gửi email cho người yêu cầu …)`,
        guide: 'Mục này là dùng cho cập nhật Deal'
    },
    { name: 'comment.author_id', type: 'int', note: 'ID của người bình luận', guide: 'Mục này là dùng cho cập nhật Deal' },
    { name: 'order_address_detail', type: 'string', note: 'Địa chỉ chi tiết ' },
    { name: 'order_buyer_note', type: 'string', note: 'Ghi chú của người mua' },
    { name: 'order_city_id', type: 'string', note: 'ID của tỉnh (Theo danh sách Tỉnh thành)' },
    { name: 'order_district_id', type: 'string', note: 'ID của huyện/quận (Theo danh sách  quận huyện)' },
    { name: 'order_ward_id', type: 'string', note: 'ID của Xã/phường (Theo danh sách xã phường)' },
    { name: 'order_receiver_name', type: 'string', note: 'Người nhận' },
    { name: 'order_receiver_phone', type: 'string', note: 'Số ĐT người nhận' },
    { name: 'order_shipping_fee', type: 'float', note: 'Cước vận chuyển' },
    {
        name: 'order_status', type: 'string', note: `Là một trong danh sách sau:
        "ORDER_STARTED": Khởi tạo đơn hàng
        "BUYER_CONFIRMED": Người mua xác nhận
        "SELLER_CONFIRMED: Nhà bán xác nhận
        "SHIPPING": Đang vận chuyển
        "RETURNED": Hoàn
        "CANCELED": Hủy
        "RECEIVED"": Đã nhận`,
        guide: `Gắn trạng thái nhanh theo trạng thái trên CareSoft. Nếu trạng thái nhanh chưa được gắn thì mặc đinh là "ORDER_STARTED"`,
    },
    { name: 'order_tracking_code', type: 'string', note: 'Mã vận chuyển' },
    { name: 'order_tracking_url', type: 'link', note: 'Đường dẫn kiểm tra trạng thái vận chuyển' },
    {
        name: 'order_products',
        type: 'array',
        note: `Mảng sản phẩm:
        "sku": Mã sản phẩm
        "is_free": Hàng tặng "1", Mặc định 0
        "unit_price": Giá tiền
        "quantity": Số lượng
        "discount_markup": Tỉ lệ giảm giá,
        "discount_value": Giảm giá bằng tiền`,
        guide: `Lưu ý: Nếu không nhập, hoặc chưa cập nhật đầy đủ sản phẩn trên CareSoft thì vui lòng giữ trạng thái "chưa nhập" phía trên. Nếu đã cập nhật đầy đủ sản phẩm trên CareSoft thì có thể đổi qua trạng thái "đã nhập" phía trên`,
        subFields: [
            { name: 'sku', type: 'string' },
            { name: 'is_free', type: 'int' },
            { name: 'unit_price', type: 'float' },
            { name: 'quantity', type: 'int' },
            { name: 'discount_markup', type: 'float' },
            { name: 'discount_value', type: 'float' },
        ],
    },
];

// Webhook fields 
export const webhookFields = [
    'orderId',
    'shopOrderId',
    'saleChannel',
    'type',
    'typeId',
    'moneyDiscount',
    'moneyDeposit',
    'moneyTransfer',
    'creditAmount',
    'usedPoints',
    'moneyUsedPoints',
    'shipFee',
    'codFee',
    'customerShipFee',
    'calcTotalMoney',
    'description',
    'customerId',
    'customerName',
    'customerEmail',
    'customerMobile',
    'customerAddress',
    'shipToCityLocationId',
    'shipToDistrictLocationId',
    'shipToWardLocationId',
    'customerCity',
    'customerDistrict',
    'customerWard',
    'createdById',
    'couponCode',
    'status',
    'statusDescription',
    'depotId',
    'trackingUrl',
    'createdDateTime',
    'reason',
    'deliveryDate',
    {
        name: 'products',
        type: 'array',
        subFields: [
            { name: 'id', type: 'string' },
            { name: 'quantity', type: 'int' },
            { name: 'price', type: 'float' },
            { name: 'discount', type: 'float' },
            { name: 'weight', type: 'float' },
        ],
    },
];