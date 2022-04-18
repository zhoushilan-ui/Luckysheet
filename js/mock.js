//调用mock方法模拟数据
//保存成功的数据
let data = [];
//保存数据
Mock.mock(
	'http://mock/save', 'post',
	function(option) {
		data.push(option.body)
		console.log(option)
		return {
			status: 200,
			message: "success",
			msg: "操作成功"
		}
	});
	console.log(data)

//获取保存数据中最新的一条数据
Mock.mock(
	'http://mock/getsave', 'get',
	function(option) {
		return {
			status: 200,
			data: data[data.length - 1],
			msg: "操作成功",
		}
	});
