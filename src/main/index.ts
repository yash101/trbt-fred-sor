import FredAPI from "./fred";
import FredSoRServer from "./grpc";

const testFn = async () => {
  const api = new FredAPI('65b94ff3307fcaaf575ab01dbd590a5d', 'https://api.stlouisfed.org');
  console.log(await api.getCategoryChildren('13'));
};

testFn();

const grpcServer = new FredSoRServer('0.0.0.0:43059');
