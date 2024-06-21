const OrderStatusMap = new Map();

OrderStatusMap.set("PENDING", "Pending");
OrderStatusMap.set("BEING_PREPARED", "Being prepared");
OrderStatusMap.set("APPROVED", "Approved");
OrderStatusMap.set("COMPLETED", "Completed");

module.exports = OrderStatusMap;