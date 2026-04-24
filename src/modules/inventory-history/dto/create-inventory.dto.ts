export class CreateInventoryHistoryDto {
  inventoryId: number;

  old_quantity: number;
  new_quantity: number;

  old_unit_cost: number;      // ✅ replaced old_price
  new_unit_cost: number;      // ✅ replaced new_price

  old_selling_price: number;  // ✅ added
  new_selling_price: number;  // ✅ added

  notes?: string;
}