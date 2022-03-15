export default () => ({
    port: Number(process.env.PORT),
    backendPrefix: Number(process.env.BACKEND_PREFIX),
    socketPort: process.env.SOCKET_PORT,
});
