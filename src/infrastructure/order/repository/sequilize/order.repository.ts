import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      { customer_id: entity.customerId },
      { where: { id: entity.id } }
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: [OrderItemModel],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const orderItems: OrderItem[] = orderModel.items.map((item: any) =>
      new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    );

    const order = new Order(orderModel.id, orderModel.customer_id, orderItems);

    return order;
  }

  async findAll(): Promise<Order[]> {
    let orderModels;
    try {
      orderModels = await OrderModel.findAll({
        include: [OrderItemModel],
      });
    } catch (error) {
      throw new Error("Error fetching orders");
    }

    if (!orderModels || orderModels.length === 0) {
      throw new Error("No orders found");
    }

    const orders: Order[] = orderModels.map((orderModel: any) => {
      const orderItems: OrderItem[] = orderModel.items.map((item: any) =>
        new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
      );
      return new Order(orderModel.id, orderModel.customer_id, orderItems);
    });

    return orders;
  }

}
