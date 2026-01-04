export class CreateInventoryHistoryDto {
  inventoryId: number;

  old_quantity: number;
  new_quantity: number;

  old_price: number;
  new_price: number;

  old_total: number;
  new_total: number;
}
