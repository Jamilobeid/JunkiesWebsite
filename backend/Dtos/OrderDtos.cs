namespace Junkies.Api.Dtos;

public record CreateOrderRequest(
    string CustomerName,
    string PhoneNumber,
    string DeliveryAddress,
    bool UsePoints,
    IEnumerable<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(int MenuItemId, int Quantity);

public record OrderResponse(
    int Id,
    string CustomerName,
    string PhoneNumber,
    string DeliveryAddress,
    decimal TotalPrice,
    decimal PointsEarned,
    decimal PointsUsed,
    decimal DiscountAmount,
    decimal FinalPrice,
    DateTime OrderDate,
    IEnumerable<OrderItemResponse> Items);

public record OrderItemResponse(string ItemName, int Quantity, decimal UnitPrice);
