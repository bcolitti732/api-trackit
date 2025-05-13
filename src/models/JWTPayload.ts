
export default interface IJwtPayload {
    name: string;
    id: string;
    type: 'access' | 'refresh';
}