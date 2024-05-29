module.exports = {
    type: 'sqlite',
    database: 'data/db.sqlite',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
};
  