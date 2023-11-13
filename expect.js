import unexpected from 'unexpected';

const expect = unexpected.clone();

function Person(name, age) {
  this.name = name;
  this.age = age;
}

expect.addType({
  name: 'Person',
  base: 'object',
  identify: function (value) {
    return value instanceof Person;
  },
});

expect(12, 'to be within', 0, 100);
// expect(new Person('John Doe', 42), 'to equal', new Person('Jane Doe', 42));