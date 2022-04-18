//配置项
var options = {
	container: 'luckysheet', //luckysheet为容器id
	column: 20, //空表格默认的列数量
	row: 20, //空表格默认的行数据量
	title: "表格名称",
	lang: 'zh', // 设定表格语言
	allowEdit: true, //作用：是否允许前台编辑
	allowUpdate: true, //允许更新
	allowCopy: true, //是否允许拷贝
	autoFormatw: true, //自动格式化
	showtoolbar: true, //是否第二列显示工具栏
	showinfobar: true, //是否显示顶部名称栏
	showsheetbar: true, //是否显示底部表格名称区域
	showstatisticBar: true, //是否显示底部计数栏
	pointEdit: true, //是否是编辑器插入表格模式
	pointEditUpdate: null, //编辑器表格更新函数
	//plugins: ['chart'], //是否插入插件，如echart
	//myFolderUrl: "/",//作用：左上角<返回按钮的链接
	// forceCalculation: false,
	//loadUrl: "downData",
	// updateUrl: "ws://localhost:8080/UserService"
	//functionButton: '<button class="btn btn-primary" style=" padding:3px 6px; font-size: 16px;width: 100px;height: 27px; margin-right: 50px;" οnclick="downExcelData(this)">導出</button>',
	hook: { //一个在D1个单元格的分别画左上角和右下角分别描绘的案例
		cellRenderAfter: function(cell, position, sheetFile, ctx) {
			var r = position.r; //代表行
			var c = position.c; //代表列
			if (r % 9 == 0 && c % 3 == 0) { // 指定处理D1单元格
				if (!window.storeUserImage) {
					window.storeUserImage = {}
				}
				if (!window.storeUserImage[r + '_' + c]) {
					window.storeUserImage[r + '_' + c] = {}
				}
				var img = null;
				var imgRight = null;
				if (window.storeUserImage[r + '_' + c].image && window.storeUserImage[r + '_' + c].imgRight) {
					// 加载过直接取
					img = window.storeUserImage[r + '_' + c].image;
					imgRight = window.storeUserImage[r + '_' + c].imgRight;

				} else {
					img = new Image();
					imgRight = new Image();
					img.src = 'https://www.dogedoge.com/favicon/developer.mozilla.org.ico';
					imgRight.src = 'https://www.dogedoge.com/static/icons/twemoji/svg/1f637.svg';
					// 图片缓存到内存，下次直接取，不用再重新加载
					window.storeUserImage[r + '_' + c].image = img;
					window.storeUserImage[r + '_' + c].imgRight = imgRight;
				}

				if (img.complete) { // 已经加载完成的直接渲染
					ctx.drawImage(img, position.start_c, position.start_r, 10, 10);
				} else {
					img.onload = function() {
						ctx.drawImage(img, position.start_c, position.start_r, 10, 10);
					}
				}

				if (imgRight.complete) {
					ctx.drawImage(imgRight, position.end_c - 10, position.end_r - 10, 10, 10);
				} else {
					imgRight.onload = function() {
						ctx.drawImage(imgRight, position.end_c - 10, position.end_r - 10, 10, 10);
					}
				}
			}
		}
	}
}
$(function() {
	luckysheet.create(options)
})

/**
 * 获取excel数据加載到頁面上
 * @param event
 */
function importExcel(event) {
	var file = event.target.files[0];
	var fileName = file.name;
	fileName = fileName + "";
	//將文件加載到頁面上
	LuckyExcel.transformExcelToLucky(file, function(exportJson, luckysheetfile) {
		if (exportJson.sheets == null || exportJson.sheets.length == 0) {
			alert("Failed to read the content of the excel file, currently does not support xls files!");
			return;
		}
		console.log(exportJson, luckysheetfile);
		window.luckysheet.destroy();
		window.luckysheet.create({
			container: 'luckysheet', //luckysheet is the container id
			column: 20, //空表格默认的列数量
			showinfobar: false,
			lang: 'zh', // 设定表格语言
			allowEdit: true, //作用：是否允许前台编辑
			allowUpdate: true, //允许更新
			allowCopy: true, //是否允许拷贝
			autoFormatw: true, //自动格式化
			showtoolbar: true, //是否第二列显示工具栏
			showinfobar: true, //是否显示顶部名称栏
			showsheetbar: true, //是否显示底部表格名称区域
			showstatisticBar: true, //是否显示底部计数栏
			pointEdit: true, //是否是编辑器插入表格模式
			pointEditUpdate: null, //编辑器表格更新函数
			data: exportJson.sheets,
			//plugins: ['chart'],
			title: exportJson.info.name,
			userInfo: exportJson.info.name.creator,
			//functionButton: '<button id="" class="btn btn-primary" style=" padding:3px 6px; font-size: 16px;width: 100px;height: 27px; margin-right: 85px;" οnclick="downExcelData()">導出</button>',

		});
	});

}

/**
 * 將在線Excel下載到本地
 */
function downExcelData() {
	// var fileName = $("#luckysheet_info_detail_input").val()
	// fileName = (fileName + "").trim();
	// $.post("/excel/downfile", {
	// 	exceldatas: JSON.stringify(luckysheet.getAllSheets()),
	// 	fileName: fileName
	// }, function(data) {
	// 	console.log("data = " + data)
	// });
	//前端直接从页面下载表格中的数据，没有与后端进行交互。
	exportExcel(luckysheet.getAllSheets(), "下载");

}
var exportExcel = async function(luckysheet) { // 参数为luckysheet.getAllSheets()获取的对象
	// 1.创建工作簿，可以为工作簿添加属性
	const workbook = new ExcelJS.Workbook()
	// 2.创建表格，第二个参数可以配置创建什么样的工作表
	luckysheet.every(function(table) {
		console.log(JSON.stringify(table.data))
		if (table.data.length === 0) return true
		const worksheet = workbook.addWorksheet(table.name)
		// 3.设置单元格合并,设置单元格边框,设置单元格样式,设置值
		setStyleAndValue(table.data, worksheet)
		setMerge(table.config.merge, worksheet)
		setBorder(table.config.borderInfo, worksheet)
		//setwidthcol(table.data, worksheet);
		return true
	})

	// 4.写入 buffer
	const buf = await workbook.xlsx.writeBuffer();
	// 下载 excel
	workbook.xlsx.writeBuffer().then((buf) => {
		let blob = new Blob([buf], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
		});
		const downloadElement = document.createElement('a')
		let href = window.URL.createObjectURL(blob)
		downloadElement.href = href
		downloadElement.download = document.getElementById("luckysheet_info_detail_input").value +
			".xlsx"; // 文件名字
		document.body.appendChild(downloadElement)
		downloadElement.click()
		document.body.removeChild(downloadElement) // 下载完成移除元素
		window.URL.revokeObjectURL(href) // 释放掉blob对象
	});

}

var setMerge = function(luckyMerge = {}, worksheet) {
	const mergearr = Object.values(luckyMerge)
	mergearr.forEach(function(elem) { // elem格式：{r: 0, c: 0, rs: 1, cs: 2}
		// 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
		worksheet.mergeCells(elem.r + 1, elem.c + 1, elem.r + elem.rs, elem.c + elem.cs)
	})
}

var setBorder = function(luckyBorderInfo, worksheet) {
	if (!Array.isArray(luckyBorderInfo)) return
	luckyBorderInfo.forEach(function(elem) {
		var val = elem.value;
		let border = {}
		const luckyToExcel = {
			type: {
				'border-all': 'all',
				'border-top': 'top',
				'border-right': 'right',
				'border-bottom': 'bottom',
				'border-left': 'left'
			},
			style: {
				0: 'none',
				1: 'thin',
				2: 'hair',
				3: 'dotted',
				4: 'dashDot', // 'Dashed',
				5: 'dashDot',
				6: 'dashDotDot',
				7: 'double',
				8: 'medium',
				9: 'mediumDashed',
				10: 'mediumDashDot',
				11: 'mediumDashDotDot',
				12: 'slantDashDot',
				13: 'thick'
			}
		}

		if (val.t != undefined) {
			border['top'] = {
				style: luckyToExcel.style[val.t.style],
				color: val.t.color
			}
		}
		if (val.r != undefined) {
			border['right'] = {
				style: luckyToExcel.style[val.r.style],
				color: val.r.color
			}
		}
		if (val.b != undefined) {
			border['bottom'] = {
				style: luckyToExcel.style[val.b.style],
				color: val.b.color
			}
		}
		if (val.l != undefined) {
			border['left'] = {
				style: luckyToExcel.style[val.l.style],
				color: val.l.color
			}
		}
		worksheet.getCell(val.row_index + 1, val.col_index + 1).border = border
	})
}
var setStyleAndValue = function(cellArr, worksheet) {
	if (!Array.isArray(cellArr)) return

	cellArr.forEach(function(row, rowid) {
		const dbrow = worksheet.getRow(rowid + 1);
		dbrow.height = luckysheet.getRowHeight([rowid])[rowid] / 1.5;
		row.every(function(cell, columnid) {
			if (!cell) return true
			if (rowid == 0) {
				const dobCol = worksheet.getColumn(columnid + 1);
				dobCol.width = luckysheet.getColumnWidth([columnid])[columnid] / 8;
			}
			let fill = fillConvert(cell.bg)
			let font = fontConvert(cell.ff, cell.fc, cell.bl, cell.it, cell.fs, cell.cl, cell.ul)
			let alignment = alignmentConvert(cell.vt, cell.ht, cell.tb, cell.tr)
			let value;

			console.log(JSON.stringify(cell));
			var v = '';
			if (!cell.hasOwnProperty('ct')) {
				
			} else if (cell.ct.t == 'inlineStr') {
				if (!cell.ct.hasOwnProperty('s')) {
					v = cell.v;
				} else {
					var s = cell.ct.s;
					s.forEach(function(val, num) {
						v += val.v;
					})
				}

			} else {
				v = cell.v;
			}
			if (cell.f) {
				value = {
					formula: cell.f,
					result: v
				}
			} else {
				value = v
			}
			let target = worksheet.getCell(rowid + 1, columnid + 1)
			target.fill = fill
			target.font = font
			target.alignment = alignment
			target.value = value
			return true
		})
	})
}


var fillConvert = function(bg) {
	if (!bg) {
		return {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {
				argb: '#ffffff'.replace('#', '')
			}
		}
	}
	let fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: {
			argb: bg.replace('#', '')
		}
	}
	return fill
}

var fontConvert = function(ff = 0, fc = '#000000', bl = 0, it = 0, fs = 10, cl = 0, ul =
	0) { // luckysheet：ff(样式), fc(颜色), bl(粗体), it(斜体), fs(大小), cl(删除线), ul(下划线)
	const luckyToExcel = {
		0: '微软雅黑',
		1: '宋体（Song）',
		2: '黑体（ST Heiti）',
		3: '楷体（ST Kaiti）',
		4: '仿宋（ST FangSong）',
		5: '新宋体（ST Song）',
		6: '华文新魏',
		7: '华文行楷',
		8: '华文隶书',
		9: 'Arial',
		10: 'Times New Roman ',
		11: 'Tahoma ',
		12: 'Verdana',
		num2bl: function(num) {
			return num === 0 ? false : true
		}
	}

	let font = {
		name: ff,
		family: 1,
		size: fs,
		color: {
			argb: fc.replace('#', '')
		},
		bold: luckyToExcel.num2bl(bl),
		italic: luckyToExcel.num2bl(it),
		underline: luckyToExcel.num2bl(ul),
		strike: luckyToExcel.num2bl(cl)
	}

	return font
}

var alignmentConvert = function(vt = 'default', ht = 'default', tb = 'default', tr =
	'default') { // luckysheet:vt(垂直), ht(水平), tb(换行), tr(旋转)
	const luckyToExcel = {
		vertical: {
			0: 'middle',
			1: 'top',
			2: 'bottom',
			default: 'top'
		},
		horizontal: {
			0: 'center',
			1: 'left',
			2: 'right',
			default: 'left'
		},
		wrapText: {
			0: false,
			1: false,
			2: true,
			default: false
		},
		textRotation: {
			0: 0,
			1: 45,
			2: -45,
			3: 'vertical',
			4: 90,
			5: -90,
			default: 0
		}
	}

	let alignment = {
		vertical: luckyToExcel.vertical[vt],
		horizontal: luckyToExcel.horizontal[ht],
		wrapText: luckyToExcel.wrapText[tb],
		textRotation: luckyToExcel.textRotation[tr]
	}
	return alignment

}

var borderConvert = function(borderType, style = 1, color = '#000') { // 对应luckysheet的config中borderinfo的的参数
	if (!borderType) {
		return {}
	}
	const luckyToExcel = {
		type: {
			'border-all': 'all',
			'border-top': 'top',
			'border-right': 'right',
			'border-bottom': 'bottom',
			'border-left': 'left'
		},
		style: {
			0: 'none',
			1: 'thin',
			2: 'hair',
			3: 'dotted',
			4: 'dashDot', // 'Dashed',
			5: 'dashDot',
			6: 'dashDotDot',
			7: 'double',
			8: 'medium',
			9: 'mediumDashed',
			10: 'mediumDashDot',
			11: 'mediumDashDotDot',
			12: 'slantDashDot',
			13: 'thick'
		}
	}
	let template = {
		style: luckyToExcel.style[style],
		color: {
			argb: color.replace('#', '')
		}
	}
	let border = {}
	if (luckyToExcel.type[borderType] === 'all') {
		border['top'] = template
		border['right'] = template
		border['bottom'] = template
		border['left'] = template
	} else {
		border[luckyToExcel.type[borderType]] = template
	}
	return border
}


/** 保存表格 */
function save() {
	var options = {
		title: 'TD游戏配置',
		lang: 'zh',
		container: 'luckysheet',
		showinfobar: false,
		data: [],
	}

	var luckysheetfile = luckysheet.getLuckysheetfile()
	if (!luckysheetfile) return;

	for (const index in luckysheetfile) {
		var sheet = luckysheetfile[index]
		options.title = sheet.name;
		options.data[index] = {
			name: sheet.name,
			index: index,
			column: sheet.data[0].length,
			row: sheet.data.length,
		}

		options.data[index].celldata = []
		var i = 0;
		for (const r in sheet.data) {
			for (const c in sheet.data[r]) {
				options.data[index].celldata[i++] = {
					r: r,
					c: c,
					v: sheet.data[r][c]
				}
			}
		}
	}

	console.log(JSON.stringify(options))

	// server.set(JSON.stringify(options), function() {
	// 	console.log("同步成功")
	// })
	//ajax请求保存的数据
	$.ajax({
		url: "http://mock/save", //请求的url地址
		dataType: "json", //返回格式为json
		async: false, //请求是否异步，默认为异步，这也是ajax重要特性
		data: JSON.stringify(options), //参数值
		type: "post", //请求方式
		success: function(res) {
			//请求成功时处理
			alert(res.msg)

		},

	});
}
