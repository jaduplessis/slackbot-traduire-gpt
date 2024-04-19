import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib/core";

interface DynamoProps {
  tableName: string;
  partitionKey?: {
    name: string;
    type: AttributeType;
  };
}

export class DynamoDBConstruct extends Construct {
  public table: Table;

  constructor(scope: Construct, id: string, props: DynamoProps) {
    super(scope, id); 

    const { tableName, partitionKey } = props;

    this.table = new Table(this, `${id}-ddb-${tableName}`, {
      tableName,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: partitionKey || { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
  }
}
