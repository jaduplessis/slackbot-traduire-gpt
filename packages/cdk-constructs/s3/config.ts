import { RemovalPolicy } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface S3Props {
  bucketName: string;
}

export class S3Construct extends Construct {
  public bucket: Bucket;

  constructor(scope: Construct, id: string, props: S3Props) {
    super(scope, id);

    const { bucketName } = props;

    this.bucket = new Bucket(scope, `${id}-s3-${bucketName}`, {
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ["*"],
          exposedHeaders: [],
          maxAge: 3000,
        },
      ],
    });
  }
}
