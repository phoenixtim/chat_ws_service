class SequelizeRepository {
  constructor({ model, convertFilterToDBConditions }) {
    this.model = model;
    this.convertFilterToDBConditions = convertFilterToDBConditions;
  }

  async find({ filter, limit, offset, sort }) {
    const where = this.convertFilterToDBConditions({ filter });

    const queryResult = await this.model.findAndCountAll({
      where,
      order: SequelizeRepository.formatSort(sort),
      limit,
      offset,
    });
    return queryResult.rows.map(instance => this.convertToSimpleObject({ instance }));
  }

  async count({ filter }) {
    const where = this.convertFilterToDBConditions({ filter });

    const total = await this.model.count({ where });
    return total;
  }

  async findOne({ filter, sort }) {
    const where = this.convertFilterToDBConditions({ filter });

    const queryResult = await this.model.findOne({
      where,
      order: SequelizeRepository.formatSort(sort),
    });
    if (!queryResult) {
      return null;
    }
    return this.convertToSimpleObject({ instance: queryResult });
  }

  async create({ values }) {
    const instance = await this.model.create(values);
    return this.convertToSimpleObject({ instance });
  }

  async update({ filter, values, options }) {
    const where = this.convertFilterToDBConditions({ filter });

    await this.model.update(values, { ...options, where });
  }

  async delete({ filter }) {
    const where = this.convertFilterToDBConditions({ filter });

    await this.model.destroy({ where });
  }

  static formatSort(sort) {
    let order;
    if (sort) {
      if (sort.startsWith('-')) {
        order = [[sort.slice(1), 'DESC']];
      } else {
        order = [[sort]];
      }
    }

    return order;
  }

  convertToSimpleObject({ instance }) {
    return this.model.getSimpleObject ? this.model.getSimpleObject({ instance }) : instance.toJSON();
  }
}

module.exports.Repository = SequelizeRepository;
