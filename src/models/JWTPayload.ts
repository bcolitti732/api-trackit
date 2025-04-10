export default interface IJwtPayload {
    id: string;
    type: 'access' | 'refresh';
}