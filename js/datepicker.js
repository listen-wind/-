/*
 * 2016-8-24
 * version:1.1
 * 日历中日期格式以 yyyy-mm-dd 为标准
 * 不支持IE7及以下
 */

/*  将一位数转换为长度为2的字符  */
function changeNumLenToTwo(a) {
    return (a + "").length < 2 ? "0" + a : (a + "");
}

/*  将时间格式转化为 yyyy-mm-dd 格式  */
function outputTimeType(date, isShowDay) {  //isShowDay 是否显示“日” false表不显示，默认显示
    isShowDay = (isShowDay === undefined) ? true : isShowDay;
    date = new Date(date);
    return date.getFullYear() + '-' + changeNumLenToTwo((date.getMonth() + 1) % 13) + ((isShowDay) ? ('-' + date.getDate()) : "");
}

/*  判断一年是否为闰年  */
function isLeapYear(year) {
    return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
}

(function ($) {
    $.fn.datepicker = function (data) {
        var myData = $.extend({
            startDate: "1000-01-01", //开始时间  '2016-07-24'
            endDate: "3000-12-31", //结束时间   '2016-07-24'
            setDatesArr: [],   //选中的时间组合   ['2016-07-24', '2016-08-27']
            signDatesArr: [],  //标记的时间组合   ['2016-07-24', '2016-08-27']
            preText: "&lt;&lt;",    //上一个月的文本内容
            nextText: "&gt;&gt;",    //下一个月的文本内容
            signClass: "sign",  //标记日期加的class名
            selected: "active",  //选中日期加的class名
            isShowPrev: true,     //上一个月按钮是否显示
            isShowNext: true,    //下一个月按钮是否显示
            isShowTitle: false,  //是否显示日历标题
            isShowWeeks: true,   //是否显示日历星期
            isShowOtherMothDate: true,   //在本月中显示其他月份的日期
            titleText: "日历",    //日历标题
            currentYearMonth: outputTimeType(new Date(), false),   //当前年月  "2016-08"
            selectedDates: [],  //放置被选中的日期
            callBack: function () {
                return false;
            }
        }, data || {});


        return this.each(function () {
            /*  上一个月  */
            window.wj_prevDate = function () {
                var currentDateArr = currentYearMoth.split("-");
                var prevMonth = parseFloat(currentDateArr[1]) == 1 ? ((parseFloat(currentDateArr[0]) - 1) + "-" + "12") : (currentDateArr[0] + "-" + changeNumLenToTwo(currentDateArr[1] - 1));
                drawDate(prevMonth);
            };

            /*  下一个月  */
            window.wj_nextDate = function () {
                var currentDateArr = currentYearMoth.split("-");
                var nextMonth = parseFloat(currentDateArr[1]) == 12 ? ((parseFloat(currentDateArr[0]) + 1) + "-" + "01") : (currentDateArr[0] + "-" + changeNumLenToTwo(parseFloat(currentDateArr[1]) + 1));
                drawDate(nextMonth);
            };

            /*  选择日历 绑定在 tbody 上  */
            window.wj_selectDate = function (event) {
                var $target = $(event.target || event.srcElement);
                if ($target.hasClass("disabled")) {
                    return false;
                }
                /*  存储获取到的时间  */
                var date = getSelectDate($target);
                var n = $.inArray(date, selectedDateArr);

                if ($target.hasClass("active")) {
                    $target.removeClass("active");
                    n !== -1 && selectedDateArr.splice(n, 1);
                } else {
                    $target.addClass("active");
                    n === -1 && selectedDateArr.push(date);
                }
                if ($target.hasClass("new")) {
                    wj_nextDate();
                } else if ($target.hasClass("old")) {
                    wj_prevDate();
                }
                $("#wj-date-input").val(selectedDateArr);
            };

            /*  获取点击处的时间 输出 yyyy-mm-dd  */
            function getSelectDate($ele) {
                var $yearMath = $ele.closest(".wj-datepicker-table").find(".wj-datepicker-switch");
                var year = $yearMath.data("year");
                var month = parseFloat($yearMath.data("month"));
                if ($ele.hasClass("new")) {
                    month == 12 && (year++);
                    ++month > 12 && (month = 1);
                } else if ($ele.hasClass("old")) {
                    month == 1 && (year--);
                    --month < 1 && (month = 12);
                }
                return year + '-' + changeNumLenToTwo(month) + '-' + changeNumLenToTwo($ele.html());
            }

            /*  匹配日期，如果匹配成功，输出class名，否则输出""  */
            function matchDate(matchArr, year, month, day, className) {  //matchArr:['2016-07-24', '2016-08-27']
                return $.inArray(changeNumLenToTwo(year) + '-' + changeNumLenToTwo(month) + '-' + changeNumLenToTwo(day), matchArr) !== -1 ? (className || "") : "";
            }

            var startDates = myData.startDate.match(/\d+/g) || [];
            var startDatesSecond = new Date(startDates[0], parseFloat(startDates[1]) - 1, startDates[2]).getTime();
            var endDates = myData.endDate.match(/\d+/g);
            var endDatesSecond = new Date(endDates[0], parseFloat(endDates[1]) - 1, endDates[2]).getTime();

            /*  绘制日历  */
            function drawDate(date) {   //  '2016-08'
                currentYearMoth = date;
                var dateArr = [];
                var dateDetailArr = date.match(/\d+/g);
                var year = parseInt(dateDetailArr[0]);
                var month = parseInt(dateDetailArr[1]);
                /*  每个月份有多少天  */
                var perMonthDaysArr = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                /*  星期的显示样式 注意第一个必须是星期日  */
                var weeksIndexArr = ["日", "一", "二", "三", "四", "五", "六"];
                /*  本月的前一个月显示的天数  */
                var frontSpaceDay = new Date(year, month - 1, 1).getDay();
                /*  本月的后一个月显示的天数  */
                var afterSpaceDay = 6 - (new Date(year, month - 1, perMonthDaysArr[month - 1]).getDay());

                /*  开始拼接日历  */
                dateArr.push('<div class="wj-datepicker"><input type="hidden" id="wj-date-input" value=""><div class="wj-datepicker-days"><table class="wj-datepicker-table" cellspacing="0" cellpadding="0"><thead>');
                /*  判断是否显示日历标题  */
                if (myData.isShowTitle) {
                    dateArr.push('<tr><th colspan="7" class="wj-datepicker-title">' + myData.titleText + '</th></tr>');
                }

                dateArr.push('<tr>');
                /*  判断是否显示上一个月按钮  */

                if (myData.isShowPrev) {
                    if ((startDatesSecond >= (new Date(year, month - 1, 1).getTime()))) {
                        dateArr.push('<th class="prev">' + myData.preText + '</th>');
                    } else {
                        dateArr.push('<th class="prev" onclick="wj_prevDate()">' + myData.preText + '</th>');
                    }
                } else {
                    dateArr.push('<th></th>');
                }
                /*  显示日历年月  */
                dateArr.push('<th colspan="5" data-year="' + year + '" data-month="' + month + '" class="wj-datepicker-switch">' + year + '年' + month + '月</th>')
                /*  判断是否显示下一个月按钮  */

                if (myData.isShowNext) {
                    if ((endDatesSecond <= (new Date(year, month - 1, perMonthDaysArr[parseFloat(month - 1)]).getTime()))) {
                        dateArr.push('<th class="prev">' + myData.nextText + '</th>');
                    } else {
                        dateArr.push('<th class="prev" onclick="wj_nextDate()">' + myData.nextText + '</th>');
                    }
                } else {
                    dateArr.push('<th></th>');
                }
                dateArr.push('</tr>');


                /*  开始拼接日历星期  */
                if (myData.isShowWeeks) {
                    dateArr.push('<tr><th class="week">' + weeksIndexArr[0] + '</th><th class="week">' + weeksIndexArr[1] + '</th><th class="week">' + weeksIndexArr[2] + '</th><th class="week">' + weeksIndexArr[3] + '</th><th class="week">' + weeksIndexArr[4] + '</th><th class="week">' + weeksIndexArr[5] + '</th><th class="week">' + weeksIndexArr[6] + '</th></tr>')
                }
                dateArr.push('</thead><tbody onclick="wj_selectDate(event)">');


                /*  拼接 1号前（上个月）的部分日期  */
                dateArr.push("<tr>");
                for (var i = 0, endNum = perMonthDaysArr[(month - 2) < 0 ? 11 : (month - 2)] - frontSpaceDay + 1; i < frontSpaceDay; i++, endNum++) {
                    if (myData.isShowOtherMothDate) {
                        var oldYear = month == 1 ? year - 1 : year;
                        var oldActive = matchDate(selectedDateArr, oldYear, parseFloat(month) - 1, endNum, " active");
                        var oldSign = matchDate(signDateArr, oldYear, parseFloat(month) - 1, endNum, " sign");
                        var oldDate = new Date(oldYear, (parseFloat(month) - 2), endNum).getTime();
                        var oldDisabled = (oldDate < startDatesSecond || oldDate > endDatesSecond) ? " disabled" : "";
                        dateArr.push('<td class="day old' + oldActive + oldSign + oldDisabled + '">' + endNum + '</td>');
                    } else {
                        dateArr.push('<td></td>');
                    }
                }

                /*  拼接本月的日期  */
                for (var j = 1; j <= perMonthDaysArr[month - 1]; j++) {
                    var active = matchDate(selectedDateArr, year, month, j, " active");
                    var sign = matchDate(signDateArr, year, month, j, " sign");
                    var nowDate = new Date(year, month - 1, j).getTime();
                    var nowDisabled = (nowDate < startDatesSecond || nowDate > endDatesSecond) ? " disabled" : "";
                    dateArr.push('<td class="day' + active + sign + nowDisabled + '">' + j + '</td>');
                    if ((frontSpaceDay + j) % 7 == 0) {
                        dateArr.push('</tr><tr>');
                    }
                }

                /*  拼接本月后面（下个月）的日期  */
                for (var k = 1; k <= afterSpaceDay; k++) {
                    if (myData.isShowOtherMothDate) {
                        var newYear = month == 12 ? year + 1 : year;
                        var newActive = matchDate(selectedDateArr, newYear, parseFloat(month) + 1, k, " active");
                        var newSign = matchDate(signDateArr, newYear, parseFloat(month) + 1, k, " sign");
                        var newDate = new Date(newYear, month, k).getTime();
                        var newDisabled = (newDate < startDatesSecond || newDate > endDatesSecond) ? " disabled" : "";
                        dateArr.push('<td class="day new' + newActive + newSign + newDisabled + '">' + k + '</td>');
                    }
                }
                dateArr.push('</tr></tbody></table></div></div>');
                $datepicker.html(dateArr.join(""));
                $("#wj-date-input").val(selectedDateArr);
            }

            /*  初始化  */
            var currentYearMoth = myData.currentYearMonth;  //格式为"2016-08"  没有日期
            var currentYearMothArr = currentYearMoth.split("-");
            var $datepicker = $(this);
            var selectedDateArr = myData.setDatesArr;
            var signDateArr = myData.signDatesArr;

            /*  初始化日历  */
            if (myData.startDate) {
                if ((new Date(currentYearMothArr[0], currentYearMothArr[1] - 1, 1)).getTime() < startDatesSecond) {
                    drawDate(startDates[0] + '-' + startDates[1]);
                } else {
                    drawDate(currentYearMoth);
                }
            }
        });
    };
}(jQuery));

