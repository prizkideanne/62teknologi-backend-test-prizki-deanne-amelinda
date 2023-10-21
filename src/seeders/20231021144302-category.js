"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const categories = [
      { id: 1, title: "Restaurant" },
      { id: 2, title: "Bar" },
      { id: 3, title: "Food Court" },
      { id: 4, title: "Fast Food" },
      { id: 5, title: "Steak" },
      { id: 6, title: "Seafood" },
      { id: 7, title: "Burger" },
      { id: 8, title: "Sushi" },
      { id: 9, title: "Pizza" },
      { id: 10, title: "Japanese" },
      { id: 11, title: "Thai" },
      { id: 12, title: "Korean" },
      { id: 13, title: "Indonesian" },
      { id: 14, title: "Dessert" },
      { id: 15, title: "Beverage" },
      { id: 16, title: "Bakery" },
    ];

    for (const category of categories) {
      category.alias = category.title.toLowerCase().replace(/ /g, "");
    }

    await queryInterface.bulkInsert("Categories", categories);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
