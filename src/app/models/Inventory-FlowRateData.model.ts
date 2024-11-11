export class InventoryFlowRateDataModel {

  public inventory ?: [];
  public actualFlowrate ?: [];
  public lastActualFlowrate ?: EntityObjectModel;
  public lastInventory ?: EntityObjectModel;

}


export class EntityObjectModel{
  public applicationId ?: string;
  public createdOn ?: Date;
  public value ?: number;
}


