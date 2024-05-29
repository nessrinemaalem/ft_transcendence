FROM postgres:latest

ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD

ENV POSTGRES_USER=$DB_USER
ENV POSTGRES_PASSWORD=$DB_PASSWORD
ENV POSTGRES_DB=$DB_NAME

EXPOSE 5432

CMD ["postgres"]

#docker exec -it tr-postgresql-1 bash
#psql -U falpha -d tr_in -h localhost -p 5432
#\dt
