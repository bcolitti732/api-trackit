export default interface IJwtPayload {
    name: string;
    type: 'access' | 'refresh';
}