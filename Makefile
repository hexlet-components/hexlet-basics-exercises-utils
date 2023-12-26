docker-build:
	docker build -t exercises-utils .

docker-run:
	docker run --rm -v $(E):/exercises --name exercises-utils exercises-utils
