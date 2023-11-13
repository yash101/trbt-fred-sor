import path from 'path';

const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');

const projPath = path.dirname(path.dirname(__dirname));
const protoPath = path.join(projPath, 'fred.sor.proto');

const packageDefinition = loader.loadSync(
  protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  },
);

const proto =
  grpc.loadPackageDefinition(packageDefinition).fred;

class FredSoRServer {
  server: any;

  constructor(bindAddress: String) {
    this.server = new grpc.Server();

    this.server.addService(
      proto.FredSoR.service, {
        // RPCs defined here
      }
    );

    this.server.bindAsync(
      bindAddress || '0.0.0.0:51203',
      grpc.ServerCredentials.createInsecure(),
      () => {
        this.server.start();
        console.log('gRPC server has started');
      }
    );
  }
}

export default FredSoRServer;
