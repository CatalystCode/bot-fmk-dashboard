var someJsonValues = [
      { id: 1, count: 2 },
      { id: 2, count: 0 }
    ];

export default {
  id: 'data',
  type: 'Constant',
  params: {
    selectedValue: 'default'
  },
  calculated: (state, dependencies) => {

    someJsonValues.push({ id: 3, count: 10 });
    return { someJsonValues };
  }
}