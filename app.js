const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.send(`
		<html>
			<head><title>Express HTML Response</title></head>
			<body>
				<h1>Hello from Express!</h1>
				<p>This is an HTML response.</p>
			</body>
		</html>
	`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
