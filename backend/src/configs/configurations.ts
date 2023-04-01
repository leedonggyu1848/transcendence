export default () => ({
	port: 3000,
	database: {
		host: process.env.DATABASE_HOST,
		port: 5432
	}
});
