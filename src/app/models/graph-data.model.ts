export class GraphData {
  public inventory ?: [];
  public actualFlowrate ?: [];
  public lastActualFlowrate ?: EntityModel;
  public lastInventory ?: EntityModel;
}

export class EntityModel{
  public applicationId ?: string;
  public value ?: number;
  public createdOn ?: string;
}
