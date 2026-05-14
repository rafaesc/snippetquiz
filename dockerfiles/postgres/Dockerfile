FROM postgres:15

COPY conf/postgresql.conf /etc/postgresql/postgresql.conf

COPY init/*.sql /docker-entrypoint-initdb.d/

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]