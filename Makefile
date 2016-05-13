all:
	echo ".read ./db/create.sql" | sqlite3 "./db/test.db"
	python ./init.py

clean:
	rm ./db/test.db
