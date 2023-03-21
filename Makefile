up:
	docker-compose up -d

down:
	docker-compose down

test-backend:
	cd maxmind-be && npm run test

test-frontend:
	cd maxmind-fe && npm run test