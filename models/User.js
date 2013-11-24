function init(Sequelize, sequelize){
  return sequelize.define('User', {
      mail: { type: Sequelize.STRING(255), allowNull: false},
      password: { type: Sequelize.STRING(40), allowNull: false, set:function(v){return config.update.update(v).digest('hex')}},
      firstName: { type: Sequelize.STRING(255), allowNull: false},
      lastName: { type: Sequelize.STRING(255), allowNull: false}
    }); 
}

module.exports.init = init;