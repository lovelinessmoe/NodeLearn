/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * version: 1.8.1
 * https://github.com/wenzhixin/bootstrap-table/
 */

!function ($) {
    'use strict';

    // TOOLS DEFINITION
    // ======================
    var isCheckAllpages = false;
    var cachedWidth = null;

    // it only does '%s', and return '' when arguments are undefined

    var sprintf = function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    var getPropertyFromOther = function (list, from, to, value) {
        var result = '';
        $.each(list, function (i, item) {
            if (item[from] === value) {
                result = item[to];
                return false;
            }
            return true;
        });
        return result;
    };

    var isHasClass = function (object, className) {
        var existsClass = false;
        while (object != undefined && object != null && $(object)[0] != null && $(object)[0].tagName != undefined && $(object)[0].tagName != 'BODY') {
            if ($(object).hasClass(className) || $(object).hasClass("jqx-listbox")) {
                existsClass = true;
                break;
            } else {
                object = $(object).parent();
            }
        }
        return existsClass;
    };

    var getFieldIndex = function (columns, field) {
        var index = -1;

        $.each(columns, function (i, column) {
            if (column.field === field) {
                index = i;
                return false;
            }
            return true;
        });
        return index;
    };

    // http://jsfiddle.net/wenyi/47nz7ez9/3/
    var setFieldIndex = function (columns) {
        var i, j, k,
            totalCol = 0,
            flag = [];

        for (i = 0; i < columns[0].length; i++) {
            totalCol += columns[0][i].colspan || 1;
        }

        for (i = 0; i < columns.length; i++) {
            flag[i] = [];
            for (j = 0; j < totalCol; j++) {
                flag[i][j] = false;
            }
        }

        for (i = 0; i < columns.length; i++) {
            for (j = 0; j < columns[i].length; j++) {
                var r = columns[i][j],
                    rowspan = r.rowspan || 1,
                    colspan = r.colspan || 1,
                    index = $.inArray(false, flag[i]);

                if (colspan === 1) {
                    r.fieldIndex = index;
                    // when field is undefined, use index instead
                    if (typeof r.field === 'undefined') {
                        r.field = index;
                    }
                }

                for (k = 0; k < rowspan; k++) {
                    flag[i + k][index] = true;
                }
                for (k = 0; k < colspan; k++) {
                    flag[i][index + k] = true;
                }
            }
        }
    }

    var getScrollBarWidth = function () {
        if (cachedWidth === null) {
            var inner = $('<p/>').addClass('fixed-table-scroll-inner'),
                outer = $('<div/>').addClass('fixed-table-scroll-outer'),
                w1, w2;

            outer.append(inner);
            $('body').append(outer);

            w1 = inner[0].offsetWidth;
            outer.css('overflow', 'scroll');
            w2 = inner[0].offsetWidth;

            if (w1 === w2) {
                w2 = outer[0].clientWidth;
            }

            outer.remove();
            cachedWidth = w1 - w2;
        }
        return cachedWidth;
    };

    var calculateObjectValue = function (self, name, args, defaultValue) {
        var func = name;

        if (typeof name === 'string') {
            // support obj.func1.func2
            var names = name.split('.');

            if (names.length > 1) {
                func = window;
                $.each(names, function (i, f) {
                    func = func[f];
                });
            } else {
                func = window[name];
            }
        }
        if (typeof func === 'object') {
            return func;
        }
        if (typeof func === 'function') {
            return func.apply(self, args);
        }
        if (!func && typeof name === 'string' && sprintf.apply(this, [name].concat(args))) {
            return sprintf.apply(this, [name].concat(args));
        }
        return defaultValue;
    };

    var goToLogin = function (response) {
        window.location.href = response.msg;
    }

    var compareObjects = function (objectA, objectB, compareLength) {
        // Create arrays of property names
        var objectAProperties = Object.getOwnPropertyNames(objectA),
            objectBProperties = Object.getOwnPropertyNames(objectB),
            propName = '';

        if (compareLength) {
            // If number of properties is different, objects are not equivalent
            if (objectAProperties.length != objectBProperties.length) {
                return false;
            }
        }

        for (var i = 0; i < objectAProperties.length; i++) {
            propName = objectAProperties[i];

            // If the property is not in the object B properties, continue with the next property
            if ($.inArray(propName, objectBProperties) > -1) {
                // If values of same property are not equal, objects are not equivalent
                if (objectA[propName] !== objectB[propName]) {
                    return false;
                }
            }
        }

        // If we made it this far, objects are considered equivalent
        return true;
    };

    var escapeHTML = function (text) {
        if (typeof text === 'string') {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        return text;
    };

    var getRealHeight = function ($el) {
        var height = 0;
        $el.children().each(function () {
            if (height < $(this).outerHeight(true)) {
                height = $(this).outerHeight(true);
            }
        });
        return height;
    };

    var getRealDataAttr = function (dataAttr) {
        for (var attr in dataAttr) {
            var auxAttr = attr.split(/(?=[A-Z])/).join('-').toLowerCase();
            if (auxAttr !== attr) {
                dataAttr[auxAttr] = dataAttr[attr];
                delete dataAttr[attr];
            }
        }

        return dataAttr;
    };

    // BOOTSTRAP TABLE CLASS DEFINITION
    // ======================

    var BootstrapTable = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.$el_ = this.$el.clone();
        this.timeoutId_ = 0;
        this.timeoutFooter_ = 0;

        this.init();
    };

    BootstrapTable.DEFAULTS = {
        classes: 'table table-hover',
        locale: undefined,
        height: undefined,
        undefinedText: '-',
        sortName: undefined,
        sortOrder: 'asc',
        striped: false,
        columns: [[]],
        data: [],
        method: 'get',
        url: undefined,
        ajax: undefined,
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        ajaxOptions: {},
        queryParams: function (params) {
            return params;
        },
        basicQueryItems: function (params) {
            return params;
        },
        advancedQueryItems: function (params) {
            return params;
        },
        compensatoryItems: function (params) {
            return params;
        },
        queryParamsType: 'limit', // undefined
        responseHandler: function (res) {
            return res;
        },
        pagination: false,
        sidePagination: 'client', // client or server
        totalRows: 0, // server side need to set
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50, 100],
        paginationHAlign: 'right', //right, left
        paginationVAlign: 'bottom', //bottom, top, both
        paginationDetailHAlign: 'left', //right, left
        paginationFirstText: '&laquo;',
        paginationPreText: '&lsaquo;',
        paginationNextText: '&rsaquo;',
        paginationLastText: '&raquo;',
        search: false,
        strictSearch: false,
        searchAlign: 'right',
        selectItemName: 'btSelectItem',
        showHeader: true,
        showFooter: false,
        showColumns: false,
        customTitle: '',
        showPaginationSwitch: false,
        showRefresh: false,
        showToggle: false,
        showAdd: false,
        addUrl: '',
        addTitle: '',
        showMultiDelete: false,
        multiDeleteUrl: '',
        multiDeleteTitle: '',
        multiDeleteWarn: '',
        showExport: false,
        exportUrl: '',
        exportTitle: '',
        buttonsAlign: 'right',
        smartDisplay: true,
        minimumCountColumns: 1,
        maxmumCountColumns: 20,
        idField: undefined,
        uniqueId: undefined,
        cardView: false,
        detailView: false,
        detailFormatter: function (index, row) {
            return '';
        },
        trimOnSearch: true,
        clickToSelect: false,
        singleSelect: false,
        toolbar: undefined,
        toolbarAlign: 'left',
        checkboxHeader: true,
        sortable: true,
        maintainSelected: false,
        searchTimeOut: 500,
        searchText: '',
        iconSize: undefined,
        iconsPrefix: 'glyphicon', // glyphicon of fa (font awesome)
        icons: {
            paginationSwitchDown: 'glyphicon-collapse-down icon-chevron-down',
            paginationSwitchUp: 'glyphicon-collapse-up icon-chevron-up',
            refresh: 'glyphicon-refresh icon-refresh',
            toggle: 'glyphicon-list-alt icon-list-alt',
            columns: 'glyphicon-th icon-th',
            detailOpen: 'glyphicon-plus icon-plus',
            detailClose: 'glyphicon-minus icon-minus'
        },


        optionBtnTitle_1: '',
        optionBtnName_1: '',
        optionBtnUrl_1: '',
        optionBtnAllowMulti_1: true,
        optionBtnMultiWarnMsg_1: '',
        optionBtnOpenType_1: '_blank',
        optionBtnWithParam_1: false,
        optionBtnCustomName_1: '',
        optionBtnTitle_2: '',
        optionBtnName_2: '',
        optionBtnUrl_2: '',
        optionBtnAllowMulti_2: true,
        optionBtnMultiWarnMsg_2: '',
        optionBtnOpenType_2: '_blank',
        optionBtnWithParam_2: false,
        optionBtnCustomName_2: '',
        optionBtnTitle_3: '',
        optionBtnName_3: '',
        optionBtnUrl_3: '',
        optionBtnAllowMulti_3: true,
        optionBtnMultiWarnMsg_3: '',
        optionBtnOpenType_3: '_blank',
        optionBtnWithParam_3: false,
        optionBtnCustomName_3: '',
        optionBtnTitle_4: '',
        optionBtnName_4: '',
        optionBtnUrl_4: '',
        optionBtnAllowMulti_4: true,
        optionBtnMultiWarnMsg_4: '',
        optionBtnOpenType_4: '_blank',
        optionBtnWithParam_4: false,
        optionBtnCustomName_4: '',
        optionBtnTitle_5: '',
        optionBtnName_5: '',
        optionBtnUrl_5: '',
        optionBtnAllowMulti_5: true,
        optionBtnMultiWarnMsg_5: '',
        optionBtnOpenType_5: '_blank',
        optionBtnWithParam_5: false,
        optionBtnCustomName_5: '',
        optionBtnTitle_6: '',
        optionBtnName_6: '',
        optionBtnUrl_6: '',
        optionBtnAllowMulti_6: true,
        optionBtnMultiWarnMsg_6: '',
        optionBtnOpenType_6: '_blank',
        optionBtnWithParam_6: false,
        optionBtnCustomName_6: '',
        optionBtnTitle_7: '',
        optionBtnName_7: '',
        optionBtnUrl_7: '',
        optionBtnAllowMulti_7: true,
        optionBtnMultiWarnMsg_7: '',
        optionBtnOpenType_7: '_blank',
        optionBtnWithParam_7: false,
        optionBtnCustomName_7: '',
        optionBtnTitle_8: '',
        optionBtnName_8: '',
        optionBtnUrl_8: '',
        optionBtnAllowMulti_8: true,
        optionBtnMultiWarnMsg_8: '',
        optionBtnOpenType_8: '_blank',
        optionBtnWithParam_8: false,
        ooptionBtnCustomName_8: '',
        optionBtnTitle_9: '',
        optionBtnName_9: '',
        optionBtnUrl_9: '',
        optionBtnAllowMulti_9: true,
        optionBtnMultiWarnMsg_9: '',
        optionBtnOpenType_9: '_blank',
        optionBtnWithParam_9: false,
        optionBtnCustomName_9: '',
        optionBtnTitle_10: '',
        optionBtnName_10: '',
        optionBtnUrl_10: '',
        optionBtnAllowMulti_10: true,
        optionBtnMultiWarnMsg_10: '',
        optionBtnOpenType_10: '_blank',
        optionBtnWithParam_10: false,
        optionBtnCustomName_10: '',
        optionBtnTitle_11: '',
        optionBtnName_11: '',
        optionBtnUrl_11: '',
        optionBtnAllowMulti_11: true,
        optionBtnMultiWarnMsg_11: '',
        optionBtnOpenType_11: '_blank',
        optionBtnWithParam_11: false,
        optionBtnCustomName_11: '',
        optionBtnTitle_12: '',
        optionBtnName_12: '',
        optionBtnUrl_12: '',
        optionBtnAllowMulti_12: true,
        optionBtnMultiWarnMsg_12: '',
        optionBtnOpenType_12: '_blank',
        optionBtnWithParam_12: false,
        optionBtnCustomName_12: '',
        optionBtnTitle_13: '',
        optionBtnName_13: '',
        optionBtnUrl_13: '',
        optionBtnAllowMulti_13: true,
        optionBtnMultiWarnMsg_13: '',
        optionBtnOpenType_13: '_blank',
        optionBtnWithParam_13: false,
        optionBtnCustomName_13: '',

        optionBtnTitle_14: '',
        optionBtnName_14: '',
        optionBtnUrl_14: '',
        optionBtnAllowMulti_14: true,
        optionBtnMultiWarnMsg_14: '',
        optionBtnOpenType_14: '_blank',
        optionBtnWithParam_14: false,
        optionBtnCustomName_14: '',

        optionBtnTitle_15: '',
        optionBtnName_15: '',
        optionBtnUrl_15: '',
        optionBtnAllowMulti_15: true,
        optionBtnMultiWarnMsg_15: '',
        optionBtnOpenType_15: '_blank',
        optionBtnWithParam_15: false,
        optionBtnCustomName_15: '',

        showCompensatory: true,
        showSelectAll: '',

        rowStyle: function (row, index) {
            return {};
        },

        rowAttributes: function (row, index) {
            return {};
        },

        onAll: function (name, args) {
            return false;
        },
        onClickCell: function (field, value, row, $element) {
            return false;
        },
        onDblClickCell: function (field, value, row, $element) {
            return false;
        },
        onClickRow: function (item, $element) {
            return false;
        },
        onDblClickRow: function (item, $element) {
            return false;
        },
        onSort: function (name, order) {
            return false;
        },
        onCheck: function (row) {
            return false;
        },
        onUncheck: function (row) {
            return false;
        },
        onCheckAll: function (rows) {
            return false;
        },
        onUncheckAll: function (rows) {
            return false;
        },
        onCheckSome: function (rows) {
            return false;
        },
        onUncheckSome: function (rows) {
            return false;
        },
        onLoadSuccess: function (data) {
            return false;
        },
        onLoadError: function (status) {
            return false;
        },
        onColumnSwitch: function (field, checked) {
            return false;
        },
        onPageChange: function (number, size) {
            return false;
        },
        onSearch: function (text) {
            return false;
        },
        onToggle: function (cardView) {
            return false;
        },
        onPreBody: function (data) {
            return false;
        },
        onPostBody: function () {
            return false;
        },
        onPostHeader: function () {
            return false;
        },
        onExpandRow: function (index, row, $detail) {
            return false;
        },
        onCollapseRow: function (index, row) {
            return false;
        },
        onRefreshOptions: function (options) {
            return false;
        },
        onResetView: function () {
            return false;
        }
    };

    BootstrapTable.LOCALES = [];

    BootstrapTable.LOCALES['en-US'] = BootstrapTable.LOCALES['en'] = {
        formatLoadingMessage: function () {
            return 'Loading, please wait...';
        },
        formatRecordsPerPage: function (pageNumber) {
            return sprintf('%s records per page', pageNumber);
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            return sprintf('Showing %s to %s of %s rows', pageFrom, pageTo, totalRows);
        },
        formatSearch: function () {
            return 'Search';
        },

        formatAdvancedSeach: function () {
            return '&equiv;Advanced Seach';
        },
        formatNoMatches: function () {
            return 'No matching records found';
        },
        formatPaginationSwitch: function () {
            return 'Hide/Show pagination';
        },
        formatRefresh: function () {
            return 'Refresh';
        },
        formatToggle: function () {
            return 'Toggle';
        },
        formatColumns: function () {
            return 'Columns';
        },
        formatAllRows: function () {
            return 'All';
        }
    };

    BootstrapTable.LOCALES['zh-CN'] = BootstrapTable.LOCALES['zh'] = {
        formatLoadingMessage: function () {
            return '载入中,请稍候...';
        },
        formatRecordsPerPage: function (pageNumber) {
            return sprintf('%s条每页', pageNumber);
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            return sprintf('显示%s-%s条,共%s条', pageFrom, pageTo, totalRows);
        },
        formatSearch: function () {
            return '搜索';
        },

        formatAdvancedSeach: function () {
            return '&equiv;高级搜索';
        },
        formatNoMatches: function () {
            return '未找到指定记录';
        },
        formatPaginationSwitch: function () {
            return '显示/隐藏分页';
        },
        formatRefresh: function () {
            return '刷新';
        },
        formatToggle: function () {
            return '切换';
        },
        formatColumns: function () {
            return '列';
        },
        formatAllRows: function () {
            return '全选';
        }
    };

    $.extend(BootstrapTable.DEFAULTS, BootstrapTable.LOCALES['zh-CN']);

    BootstrapTable.COLUMN_DEFAULTS = {
        radio: false,
        checkbox: false,
        checkboxEnabled: true,
        field: undefined,
        title: undefined,
        titleTooltip: undefined,
        'class': undefined,
        align: undefined, // left, right, center
        halign: undefined, // left, right, center
        falign: undefined, // left, right, center
        valign: undefined, // top, middle, bottom
        width: undefined,
        sortable: false,
        order: 'asc', // asc, desc
        visible: true,
        switchable: true,
        clickToSelect: true,
        formatter: undefined,
        footerFormatter: undefined,
        events: undefined,
        sorter: undefined,
        sortName: undefined,
        cellStyle: undefined,
        searchable: true,
        searchFormatter: true,
        cardVisible: true
    };

    BootstrapTable.EVENTS = {
        'all.bs.table': 'onAll',
        'click-cell.bs.table': 'onClickCell',
        'dbl-click-cell.bs.table': 'onDblClickCell',
        'click-row.bs.table': 'onClickRow',
        'dbl-click-row.bs.table': 'onDblClickRow',
        'sort.bs.table': 'onSort',
        'check.bs.table': 'onCheck',
        'uncheck.bs.table': 'onUncheck',
        'check-all.bs.table': 'onCheckAll',
        'uncheck-all.bs.table': 'onUncheckAll',
        'check-some.bs.table': 'onCheckSome',
        'uncheck-some.bs.table': 'onUncheckSome',
        'load-success.bs.table': 'onLoadSuccess',
        'load-error.bs.table': 'onLoadError',
        'column-switch.bs.table': 'onColumnSwitch',
        'page-change.bs.table': 'onPageChange',
        'search.bs.table': 'onSearch',
        'toggle.bs.table': 'onToggle',
        'pre-body.bs.table': 'onPreBody',
        'post-body.bs.table': 'onPostBody',
        'post-header.bs.table': 'onPostHeader',
        'expand-row.bs.table': 'onExpandRow',
        'collapse-row.bs.table': 'onCollapseRow',
        'refresh-options.bs.table': 'onRefreshOptions',
        'reset-view.bs.table': 'onResetView'
    };

    BootstrapTable.prototype.init = function () {
        this.initLocale();
        this.initContainer();
        this.initTable();
        this.initHeader();
        this.initData();
        this.initFooter();
        this.initToolbar();
        this.initPagination();
        this.initBody();
        this.initServer();
    };

    BootstrapTable.prototype.initLocale = function () {
        if (this.options.locale) {
            var parts = this.options.locale.split(/-|_/);
            parts[0].toLowerCase();
            parts[1] && parts[1].toUpperCase();
            if ($.fn.bootstrapTable.locales[this.options.locale]) {
                // locale as requested
                $.extend(this.options, $.fn.bootstrapTable.locales[this.options.locale]);
            } else if ($.fn.bootstrapTable.locales[parts.join('-')]) {
                // locale with sep set to - (in case original was specified with _)
                $.extend(this.options, $.fn.bootstrapTable.locales[parts.join('-')]);
            } else if ($.fn.bootstrapTable.locales[parts[0]]) {
                // short locale language code (i.e. 'en')
                $.extend(this.options, $.fn.bootstrapTable.locales[parts[0]]);
            }
        }
    };

    BootstrapTable.prototype.initContainer = function () {
        this.$container = $([
            '<div class="bootstrap-table" style="width:100%">',
            '<div class="fixed-table-toolbar"></div>',
            this.options.paginationVAlign === 'top' || this.options.paginationVAlign === 'both' ?
                '<div class="fixed-table-pagination" style="clear: both;"></div>' :
                '',
            '<div class="fixed-table-container">',
            '<div class="fixed-table-header"><table></table></div>',
            '<div class="fixed-table-body">',
            '<div class="fixed-table-loading">',
            this.options.formatLoadingMessage(),
            '</div>',
            '</div>',
            '<div class="fixed-table-footer"><table><tr></tr></table></div>',
            this.options.paginationVAlign === 'bottom' || this.options.paginationVAlign === 'both' ?
                '<div class="fixed-table-pagination"></div>' :
                '',
            '</div>',
            '</div>'
        ].join(''));

        this.$container.insertAfter(this.$el);
        this.$tableContainer = this.$container.find('.fixed-table-container');
        this.$tableHeader = this.$container.find('.fixed-table-header');
        this.$tableBody = this.$container.find('.fixed-table-body');
        this.$tableLoading = this.$container.find('.fixed-table-loading');
        this.$tableFooter = this.$container.find('.fixed-table-footer');
        this.$toolbar = this.$container.find('.fixed-table-toolbar');
        this.$pagination = this.$container.find('.fixed-table-pagination');

        this.$tableBody.append(this.$el);
        this.$container.after('<div class="clearfix"></div>');

        this.$el.addClass(this.options.classes);
        if (this.options.striped) {
            this.$el.addClass('table-striped');
        }
        if ($.inArray('table-no-bordered', this.options.classes.split(' ')) !== -1) {
            this.$tableContainer.addClass('table-no-bordered');
        }
    };

    BootstrapTable.prototype.initTable = function () {
        var that = this,
            columns = [],
            data = [];

        this.$header = this.$el.find('thead');
        if (!this.$header.length) {
            this.$header = $('<thead></thead>').appendTo(this.$el);
        }
        this.$header.find('tr').each(function () {
            var column = [];

            $(this).find('th').each(function () {
                column.push($.extend({}, {
                    title: $(this).html(),
                    'class': $(this).attr('class'),
                    titleTooltip: $(this).attr('title'),
                    rowspan: $(this).attr('rowspan') ? +$(this).attr('rowspan') : undefined,
                    colspan: $(this).attr('colspan') ? +$(this).attr('colspan') : undefined
                }, $(this).data()));
            });
            columns.push(column);
        });
        if (!$.isArray(this.options.columns[0])) {
            this.options.columns = [this.options.columns];
        }
        this.options.columns = $.extend(true, [], columns, this.options.columns);
        this.columns = [];

        setFieldIndex(this.options.columns);
        $.each(this.options.columns, function (i, columns) {
            $.each(columns, function (j, column) {
                column = $.extend({}, BootstrapTable.COLUMN_DEFAULTS, column);

                if (typeof column.fieldIndex !== 'undefined') {
                    that.columns[column.fieldIndex] = column;
                }

                that.options.columns[i][j] = column;
            });
        });

        // if options.data is setting, do not process tbody data
        if (this.options.data.length) {
            return;
        }

        this.$el.find('tbody tr').each(function () {
            var row = {};

            // save tr's id, class and data-* attributes
            row._id = $(this).attr('id');
            row._class = $(this).attr('class');
            row._data = getRealDataAttr($(this).data());

            $(this).find('td').each(function (i) {
                var field = that.columns[i].field;

                row[field] = $(this).html();
                // save td's id, class and data-* attributes
                row['_' + field + '_id'] = $(this).attr('id');
                row['_' + field + '_class'] = $(this).attr('class');
                row['_' + field + '_rowspan'] = $(this).attr('rowspan');
                row['_' + field + '_title'] = $(this).attr('title');
                row['_' + field + '_data'] = getRealDataAttr($(this).data());
            });
            data.push(row);
        });
        this.options.data = data;
    };

    BootstrapTable.prototype.initHeader = function () {
        var that = this,
            visibleColumns = {},
            html = [];

        this.header = {
            fields: [],
            styles: [],
            classes: [],
            formatters: [],
            events: [],
            sorters: [],
            sortNames: [],
            cellStyles: [],
            searchables: []
        };

        $.each(this.options.columns, function (i, columns) {
            html.push('<tr>');

            if (i == 0 && !that.options.cardView && that.options.detailView) {
                html.push(sprintf('<th class="detail" rowspan="%s"><div class="fht-cell"></div></th>',
                    that.options.columns.length));
            }

            $.each(columns, function (j, column) {
                var text = '',
                    halign = '', // header align style
                    align = '', // body align style
                    style = '',
                    class_ = sprintf(' class="%s"', column['class']),
                    order = that.options.sortOrder || column.order,
                    unitWidth = 'px',
                    width = column.width;

                if (column.width !== undefined && (!that.options.cardView)) {
                    if (typeof column.width === 'string') {
                        if (column.width.indexOf('%') !== -1) {
                            unitWidth = '%';
                        }
                    }
                }
                if (column.width && typeof column.width === 'string') {
                    width = column.width.replace('%', '').replace('px', '');
                }

                halign = sprintf('text-align: %s; ', column.halign ? column.halign : column.align);
                align = sprintf('text-align: %s; ', column.align);
                style = sprintf('vertical-align: %s; ', column.valign);
                style += sprintf('width: %s%s; ', column.checkbox || column.radio ? 36 : width, unitWidth);

                if (typeof column.fieldIndex !== 'undefined') {
                    that.header.fields[column.fieldIndex] = column.field;
                    that.header.styles[column.fieldIndex] = align + style;
                    that.header.classes[column.fieldIndex] = class_;
                    that.header.formatters[column.fieldIndex] = column.formatter;
                    that.header.events[column.fieldIndex] = column.events;
                    that.header.sorters[column.fieldIndex] = column.sorter;
                    that.header.sortNames[column.fieldIndex] = column.sortName;
                    that.header.cellStyles[column.fieldIndex] = column.cellStyle;
                    that.header.searchables[column.fieldIndex] = column.searchable;
                    if (!column.visible) {
                        return;
                    }

                    if (that.options.cardView && (!column.cardVisible)) {
                        return;
                    }

                    visibleColumns[column.field] = column;
                }


                html.push('<th' + sprintf(' title="%s"', column.titleTooltip),
                    column.checkbox || column.radio ?
                        sprintf(' class="bs-checkbox %s"', column['class'] || '') :
                        class_,
                    sprintf(' style="%s"', halign + style),
                    sprintf(' rowspan="%s"', column.rowspan),
                    sprintf(' colspan="%s"', column.colspan),
                    sprintf(' data-field="%s"', column.field),
                    sprintf(' data-sortable="true"', column.sortable),
                    '>');

                html.push(sprintf('<div class="th-inner %s">', that.options.sortable && column.sortable ?
                    'sortable both' : ''));

                text = column.title;

                if (column.checkbox) {
                    if (!that.options.singleSelect && that.options.checkboxHeader) {
//                        text = '<input name="btSelectAll" type="checkbox" />';
//                        if(that.options.showSelectAll=="true"){
//                        text=text+'<div class="ck_box" name="ck_box" id="selectAllBtn"></div><div class="ck_box_menu" id="ck_box_menu" style="display:none"><input id="btSelectAllPages" name="btSelectAllPages" type="checkbox">选择全部</div>';
//                        }
                        text = ' 选择 ';
                    }
                    that.header.stateField = column.field;
                }
                if (column.radio) {
                    text = '';
                    that.header.stateField = column.field;
                    that.options.singleSelect = true;
                }

                html.push(text);
                html.push('</div>');
                html.push('<div class="fht-cell"></div>');
                html.push('</div>');
                html.push('</th>');
            });
            html.push('</tr>');
        });

        this.$header.html(html.join(''));
        this.$header.find('th[data-field]').each(function (i) {
            $(this).data(visibleColumns[$(this).data('field')]);
        });
        this.$container.off('click', '.th-inner').on('click', '.th-inner', function (event) {
            if (that.options.sortable && $(this).parent().data().sortable) {
                that.onSort(event);
            }
        });

        if (!this.options.showHeader || this.options.cardView) {
            this.$header.hide();
            this.$tableHeader.hide();
            this.$tableLoading.css('top', 0);
        } else {
            this.$header.show();
            this.$tableHeader.show();
            this.$tableLoading.css('top', this.$header.outerHeight() + 1);
            // Assign the correct sortable arrow
            this.getCaret();
        }

        this.$selectAll = this.$header.find('[name="btSelectAll"]');
        this.$container.off('click', '[name="btSelectAll"]')
            .on('click', '[name="btSelectAll"]', function () {
                var checked = $(this).prop('checked');
                that[checked ? 'checkAll' : 'uncheckAll']();
                if (!checked) {
                    $("#btSelectAllPages").prop("checked", false);
                    isCheckAllpages = false;
                }
            });
        this.$container.off('click', '[name="ck_box"]')
            .on('click', '[name="ck_box"]', function () {
                if ($('#ck_box_menu').is(':hidden')) {
                    $("#ck_box_menu").show();
                } else {
                    $("#ck_box_menu").hide();
                }
            });
        this.$container.off('click', '[name="btSelectAllPages"]')
            .on('click', '[name="btSelectAllPages"]', function () {
                var checked = $(this).prop('checked');
                that[checked ? 'checkAll' : 'uncheckAll']();
                if (checked) {
                    isCheckAllpages = true;
                    $("#btSelectAll").prop("checked", true);
                } else {
                    $("#btSelectAll").prop("checked", false);
                    isCheckAllpages = false;
                }
            });

    };

    BootstrapTable.prototype.initFooter = function () {
        if (!this.options.showFooter || this.options.cardView) {
            this.$tableFooter.hide();
        } else {
            this.$tableFooter.show();
        }
    };

    /**
     * @param data
     * @param type: append / prepend
     */
    BootstrapTable.prototype.initData = function (data, type) {
        if (type === 'append') {
            this.data = this.data.concat(data);
        } else if (type === 'prepend') {
            this.data = [].concat(data).concat(this.data);
        } else {
            this.data = data || this.options.data;
        }

        // Fix #839 Records deleted when adding new row on filtered table
        if (type === 'append') {
            this.options.data = this.options.data.concat(data);
        } else if (type === 'prepend') {
            this.options.data = [].concat(data).concat(this.options.data);
        } else {
            this.options.data = this.data;
        }

        if (this.options.sidePagination === 'server') {
            return;
        }
        this.initSort();
    };

    BootstrapTable.prototype.initSort = function () {
        var that = this,
            name = this.options.sortName,
            order = this.options.sortOrder === 'desc' ? -1 : 1,
            index = $.inArray(this.options.sortName, this.header.fields);

        if (index !== -1) {
            this.data.sort(function (a, b) {
                if (that.header.sortNames[index]) {
                    name = that.header.sortNames[index];
                }
                var aa = a[name],
                    bb = b[name],
                    value = calculateObjectValue(that.header, that.header.sorters[index], [aa, bb]);

                if (value !== undefined) {
                    return order * value;
                }

                // Fix #161: undefined or null string sort bug.
                if (aa === undefined || aa === null) {
                    aa = '';
                }
                if (bb === undefined || bb === null) {
                    bb = '';
                }

                // IF both values are numeric, do a numeric comparison
                if ($.isNumeric(aa) && $.isNumeric(bb)) {
                    // Convert numerical values form string to float.
                    aa = parseFloat(aa);
                    bb = parseFloat(bb);
                    if (aa < bb) {
                        return order * -1;
                    }
                    return order;
                }

                if (aa === bb) {
                    return 0;
                }

                // If value is not a string, convert to string
                if (typeof aa !== 'string') {
                    aa = aa.toString();
                }

                if (aa.localeCompare(bb) === -1) {
                    return order * -1;
                }

                return order;
            });
        }
    };

    BootstrapTable.prototype.onSort = function (event) {
        var $this = $(event.currentTarget).parent(),
            $this_ = this.$header.find('th').eq($this.index());

        this.$header.add(this.$header_).find('span.order').remove();

        if (this.options.sortName === $this.data('field')) {
            this.options.sortOrder = this.options.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.options.sortName = $this.data('field');
            this.options.sortOrder = $this.data('order') === 'asc' ? 'desc' : 'asc';
        }
        this.trigger('sort', this.options.sortName, this.options.sortOrder);

        $this.add($this_).data('order', this.options.sortOrder);

        // Assign the correct sortable arrow
        this.getCaret();

        if (this.options.sidePagination === 'server') {
            this.initServer();
            return;
        }

        this.initSort();
        this.initBody();
    };

    BootstrapTable.prototype.initToolbar = function () {
        var that = this,
            html = [],
            timeoutId = 0,
            $keepOpen,
            $search,
            $advSearchBtn,
            switchableCount = 0;

        this.$toolbar.html('');


        // showColumns, showToggle, showRefresh
        /*html = [sprintf('<div class="columns columns-%s btn-group pull-%s">',
            this.options.buttonsAlign, this.options.buttonsAlign)];*/
        html = [
            sprintf('<div class="oper_menu">')];

        if (typeof this.options.toolbar === 'string') {
            $(sprintf('<div class="bars pull-%s"></div>', this.options.toolbarAlign))
                .appendTo(this.$toolbar)
                .append($(this.options.toolbar));
        }

        if (typeof this.options.icons === 'string') {
            this.options.icons = calculateObjectValue(null, this.options.icons);
        }

        html.push(sprintf('<div class="but_icon R" title="%s">',
            this.options.formatColumns()));

        if (this.options.showPaginationSwitch) {
            html.push(sprintf('<button class="btn btn-default" type="button" name="paginationSwitch" title="%s">',
                this.options.formatPaginationSwitch()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.paginationSwitchDown),
                '</button>');
        }

        if (this.options.showRefresh) {
            html.push(sprintf('<button class="btn btn-default' + (this.options.iconSize === undefined ? '' : ' btn-' + this.options.iconSize) + '" type="button" name="refresh" title="%s">',
                this.options.formatRefresh()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.refresh),
                '</button>');
        }

        if (this.options.showToggle) {
            html.push(sprintf('<button class="btn btn-default' + (this.options.iconSize === undefined ? '' : ' btn-' + this.options.iconSize) + '" type="button" name="toggle" title="%s">',
                this.options.formatToggle()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.toggle),
                '</button>');
        }


        if (this.options.showCompensatory) {
            var compensatory = calculateObjectValue(this.options, this.options.compensatoryItems, [], []);
            if (null != compensatory && compensatory != undefined && compensatory != 'undefined') {
                $.each(compensatory, function (i, e) {
                    if (e != undefined) {
                        var type = e.type;
                        if ('label' === type) {

                        } else if ('input' === type) {
                            html.push(
                                sprintf('<input class="compensatory input_box wid_50" name="%s" type="text" placeholder="%s">', e.key, e.placeholder)
                            );
                        } else if ('list' === type) {
                            html.push(sprintf('<select class="search_item input_box" name="%s">', e.key));

                            var options = e.items;
                            if (null != options && options != undefined && options != 'undefined') {
                                $.each(options, function (i, e) {
                                    html.push(sprintf('<option value="%s">%s</option>', e.key, e.value));
                                });
                            }
                            html.push('</select>');
                        } else if ('span' == type) {
                            html.push(
                                sprintf('<span style="%s;" name="%s">%s</span>', e.style, e.name, e.key)
                            );
                        }
                    }
                });
                html.push(
                    sprintf('<span></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
                );

            }
        }


        if ('' != this.options.optionBtnTitle_1 && '' != this.options.optionBtnUrl_1 && '' != this.options.optionBtnName_1) {
            html.push('<button type="button" name="' + this.options.optionBtnName_1 + '">' + this.options.optionBtnTitle_1 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_2 && '' != this.options.optionBtnUrl_2 && '' != this.options.optionBtnName_2) {
            html.push('<button type="button" name="' + this.options.optionBtnName_2 + '">' + this.options.optionBtnTitle_2 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_3 && '' != this.options.optionBtnUrl_3 && '' != this.options.optionBtnName_3) {
            html.push('<button type="button" name="' + this.options.optionBtnName_3 + '">' + this.options.optionBtnTitle_3 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_4 && '' != this.options.optionBtnUrl_4 && '' != this.options.optionBtnName_4) {
            html.push('<button type="button" name="' + this.options.optionBtnName_4 + '">' + this.options.optionBtnTitle_4 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_5 && '' != this.options.optionBtnUrl_5 && '' != this.options.optionBtnName_5) {
            html.push('<button type="button" name="' + this.options.optionBtnName_5 + '">' + this.options.optionBtnTitle_5 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_6 && '' != this.options.optionBtnUrl_6 && '' != this.options.optionBtnName_6) {
            html.push('<button type="button" name="' + this.options.optionBtnName_6 + '">' + this.options.optionBtnTitle_6 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_7 && '' != this.options.optionBtnUrl_7 && '' != this.options.optionBtnName_7) {
            html.push('<button type="button" name="' + this.options.optionBtnName_7 + '">' + this.options.optionBtnTitle_7 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_8 && '' != this.options.optionBtnUrl_8 && '' != this.options.optionBtnName_8) {
            html.push('<button type="button" name="' + this.options.optionBtnName_8 + '">' + this.options.optionBtnTitle_8 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_9 && '' != this.options.optionBtnUrl_9 && '' != this.options.optionBtnName_9) {
            html.push('<button type="button" name="' + this.options.optionBtnName_9 + '">' + this.options.optionBtnTitle_9 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_10 && '' != this.options.optionBtnUrl_10 && '' != this.options.optionBtnName_10) {
            html.push('<button type="button" name="' + this.options.optionBtnName_10 + '">' + this.options.optionBtnTitle_10 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_11 && '' != this.options.optionBtnUrl_11 && '' != this.options.optionBtnName_11) {
            html.push('<button type="button" name="' + this.options.optionBtnName_11 + '">' + this.options.optionBtnTitle_11 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_12 && '' != this.options.optionBtnUrl_12 && '' != this.options.optionBtnName_12) {
            html.push('<button type="button" name="' + this.options.optionBtnName_12 + '">' + this.options.optionBtnTitle_12 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_13 && '' != this.options.optionBtnUrl_13 && '' != this.options.optionBtnName_13) {
            html.push('<button type="button" name="' + this.options.optionBtnName_13 + '">' + this.options.optionBtnTitle_13 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_14 && '' != this.options.optionBtnUrl_14 && '' != this.options.optionBtnName_14) {
            html.push('<button type="button" name="' + this.options.optionBtnName_14 + '">' + this.options.optionBtnTitle_14 + '</button>');
        }

        if ('' != this.options.optionBtnTitle_15 && '' != this.options.optionBtnUrl_15 && '' != this.options.optionBtnName_15) {
            html.push('<button type="button" name="' + this.options.optionBtnName_15 + '">' + this.options.optionBtnTitle_15 + '</button>');
        }

        if (this.options.showAdd) {
            html.push('<button type="button" name="add">' + this.options.addTitle + '</button>');
        }

        if (this.options.showMultiDelete) {
            html.push('<button type="button" name="delete">' + this.options.multiDeleteTitle + '</button>');
        }
        if (this.options.showExport) {
            html.push('<button type="button" name="export">' + this.options.exportTitle + '</button>');
        }

        if (this.options.showColumns) {
            var btnHtml = "";
            html.push('<button type="button" data-toggle="dropdown">' + this.options.customTitle,
                '</button>',
                '<div class="xlcd_mod">',
                '<ul role="menu">');

            $.each(this.columns, function (i, column) {
                if (column.radio || column.checkbox) {
                    return;
                }

                if (that.options.cardView && (!column.cardVisible)) {
                    return;
                }

                var checked = column.visible ? ' checked="checked"' : '';
                if (column.button) {
//                	btnHtml='<label><div class="but_icon"><button type="button" onclick="'+column.onclick+'();">保存</button></div></label>';
                    btnHtml = '<label><div class="but_icon"><button type="button" title="保存" onclick="' + column.onclick + '();">保存</button></div></label>';
                    switchableCount++;
                } else if (column.switchable) {
                    html.push(sprintf('<li>' +
                        '<label><input type="checkbox" data-field="%s" value="%s"%s> %s</label>' +
                        '</li>', column.field, i, checked, column.title));
                    switchableCount++;
                }
            });
            html.push('</ul>', btnHtml,
                '</div></div>');
        }

        var storage_text = sessionStorage.getItem(pageName() + "_search");
        var storage_object = null;
//        alert(storage_text);
        if (storage_text != null && storage_text.length > 1) {
            storage_object = JSON.parse(storage_text);
        }

        function getItem(array, key) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].key == key) {
                    return array[i].value;
                }
            }
            return "";
        }


        if (this.options.search) {
            var showSearchBtn = false;
            html.push(sprintf('<div class="search_top_box" >'));
            //基础搜索项
            var basicQueryItems = calculateObjectValue(null, this.options.basicQueryItems, [], []);
            if (null != basicQueryItems && basicQueryItems != undefined && basicQueryItems != 'undefined') {
                if (basicQueryItems.length > 0) {
                    showSearchBtn = true;
                }
                $.each(basicQueryItems, function (i, e) {
                    if (e != undefined) {
                        var type = e.type;
                        if ('label' === type) {

                        } else if ('input' === type) {
                            html.push(
                                sprintf('<input class="search_item input_box" type="text" placeholder="%s" name="%s">', e.placeholder, e.key)
                            );
                        } else if ('date' === type) {
                            html.push(
                                sprintf('<input class="search_item input_box" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" placeholder="%s" name="%s">', e.placeholder, e.key)
                            );
                        } else if ('list' === type) {
                            var options = e.items;
                            html.push(sprintf('<div id="%s" name="%s" class="search_item_tag" style="margin-right:5px;float:left;width: 100px;height: 30px;line-height: 21px;font-size: 12px;"></div>', e.key, e.key));
                        } else if ('dateRange' === type) {

                            html.push(sprintf('<td class="right_txt"><label>%s</label></td><td colspan="3">', e.label));
                            html.push(
                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s" id="formDate"' + dateIndex + '>', e.keyfrom),
                                sprintf('&nbsp;%s&nbsp;&nbsp;&nbsp;', e.connector),
//	                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s">', e.keyto)
                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s" id="toDate"' + dateIndex + '>', e.keyto)
                            );
                            html.push('</td>');

                        } else if ('dateRange_ymd' === type) {

                            html.push(sprintf('<td class="right_txt"><label>%s</label></td><td colspan="3">', e.label));
                            html.push(
                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd\'})" type="text" name="%s" id="formDate"' + dateIndex + '>', e.keyfrom),
                                sprintf('&nbsp;%s&nbsp;&nbsp;&nbsp;', e.connector),
//	                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s">', e.keyto)
                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd\'})" type="text" name="%s" id="toDate"' + dateIndex + '>', e.keyto)
                            );
                            html.push('</td>');

                        }
                    }
                });
            }

            if (showSearchBtn) {
                var showAdvancedQuery = false;
                var advancedQueryItems = calculateObjectValue(this.options, this.options.advancedQueryItems, [], []);
                if (null != advancedQueryItems && advancedQueryItems != undefined && advancedQueryItems != 'undefined' && advancedQueryItems.length > 0) {
                    showAdvancedQuery = true;
                }
                if (showAdvancedQuery) {
                    html.push('<button type="button" class="btn_mod"  style="z-index:0;" id="zzos_adv_search_btn">' + this.options.formatAdvancedSeach() + '</button>');
                }
                html.push('<button type="button" class="btn_mod" id="zzos_search_btn">' + this.options.formatSearch() + '</button>');
                if (showAdvancedQuery) {
                    //高级搜索
                    html.push('<div class="layer_box" id="adv_search_div" style="display:none;"><div class="layer_bg"></div><div class="layer_center"><div class=" layer_text"><h1><div class="close"><a href="javascript:closeRegionDiv()"><span>关闭</span></a>');
                    html.push('</div><span id="titleSpan">高级搜索</span></h1>');
                    html.push('<div class="search_hov_box">', '<table class="search_table">');

                    var isLast = true;//是否是最后一个元素
                    var lineContrl = 0;//换行控制符
                    var dateIndex = 1;
                    $.each(advancedQueryItems, function (i, e) {
                        if (e != undefined) {
                            if (lineContrl % 2 === 0) {
                                html.push('<tr>');
                            }

                            var type = e.type;
                            if ('input' === type) {
                                html.push(sprintf('<td class="right_txt"><label>%s</label></td><td>', e.label));
                                html.push(
                                    sprintf('<input name="%s" type="text" class="adv_search_item wb_mod">', e.key)
                                );
                                html.push('</td>');
                            } else if ('date' === type) {
                                html.push(sprintf('<td class="right_txt"><label>%s</label></td><td>', e.label));
                                html.push(
                                    sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s">', e.key)
                                );
                                html.push('</td>');
                            } else if ('list' === type) {
                                html.push(sprintf('<td class="text_rihgt adv_tag" style="padding-left: 30px;"><label  class="adv_tag">%s</label></td><td style="padding-left: 10px;">', e.label));
                                html.push(sprintf('<div id="%s" name="%s" class="adv_tag search_item_tag" style="margin-right:5px;float:left;width: 100px;height: 30px;line-height: 21px;font-size: 12px;"></div>', e.key, e.key));
                                html.push('</td>');
                            } else if ('dateRange' === type) {
                                if (i != 0) {
                                    html.push('</tr><tr>');
                                }
                                html.push(sprintf('<td class="right_txt"><label>%s</label></td><td colspan="3">', e.label));
                                html.push(
                                    sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s" id="formDate"' + dateIndex + '>', e.keyfrom),
                                    sprintf('&nbsp;%s&nbsp;&nbsp;&nbsp;', e.connector),
//	                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s">', e.keyto)
                                    sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s" id="toDate"' + dateIndex + '>', e.keyto)
                                );
                                html.push('</td>');
                                if (i === (advancedQueryItems.length - 1)) {
                                    isLast = false;
                                }
                                lineContrl = 1;
                                dateIndex++;
                            } else if ('dateRange_ymd' === type) {
                                if (i != 0) {
                                    html.push('</tr><tr>');
                                }
                                html.push(sprintf('<td class="right_txt"><label>%s</label></td><td colspan="3">', e.label));
                                html.push(
                                    sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd\'})" type="text" name="%s" id="formDate"' + dateIndex + '>', e.keyfrom),
                                    sprintf('&nbsp;%s&nbsp;&nbsp;&nbsp;', e.connector),
//	                                sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd HH:mm:ss\'})" type="text" name="%s">', e.keyto)
                                    sprintf('<input class="adv_search_item wb_mod" onFocus="WdatePicker({isShowClear:true,dateFmt:\'yyyy-MM-dd\'})" type="text" name="%s" id="toDate"' + dateIndex + '>', e.keyto)
                                );
                                html.push('</td>');
                                if (i === (advancedQueryItems.length - 1)) {
                                    isLast = false;
                                }
                                lineContrl = 1;
                                dateIndex++;
                            } else if ('textarea' == type) {
                                if (i != 0) {
                                    html.push('</tr><tr>');
                                }
                                html.push(sprintf('<td class="right_txt"><label>%s</label></td><td colspan="3">', e.label));
                                html.push(
                                    sprintf('<textarea  class="adv_search_item wb_mod" rows="5" cols="60"   name="%s"></textarea><br/>(请用逗号,作为多个用户名之间的间隔，例如:user1,user2，单次最多500个)', e.key)
                                );


                                html.push('</td></tr>');
                            }


                            if (lineContrl % 2 === 1) {
                                html.push('</tr>');
                            }
                            lineContrl++;
                        }
                    });

                    if (length && advancedQueryItems.length % 2 === 1) {
                        html.push('</tr>');
                    }

                    html.push('</table><div class="text_center"><button class="layer_input_btn" type="button" id="zzos_search_btn_gj" ><span>确认</span></button></div>', '</div>');
                    html.push('</div></div></div>');

                }


            }
            html.push('</div>');


        }


        // Fix #188: this.showToolbar is for extentions
        if (this.showToolbar || html.length > 2) {
            this.$toolbar.append(html.join(''));
        }

        if (null != basicQueryItems && basicQueryItems != undefined && basicQueryItems != 'undefined') {
            $.each(basicQueryItems, function (i, e) {
                if (e != undefined) {
                    var type = e.type;
                    if ('list' === type) {
                        var options = e.items;
                        var source1 = [];
                        var filterable = true;
                        var filterPlaceHolder = "请输入关键字";
                        if (null != options && options != undefined && options != 'undefined') {
                            $.each(options, function (i, e) {
                                source1.push({text: e.value, value: e.key});
                                if (e.filterable != "undefined" && e.filterable != undefined) {
                                    filterable = e.filterable;
                                }
                                if (e.filterPlaceHolder != "undefined" && e.filterPlaceHolder != undefined) {
                                    filterPlaceHolder = e.filterPlaceHolder;
                                }
                            });
                        }
                        var width = e.width != undefined ? e.width : 150;
                        var divid = "#" + e.key;
                        //TODO 填写drop的生成
                        divid = divid.replace('.', '\\.');
                        $(divid).jqxDropDownList({
                            source: source1,
                            filterable: filterable,
                            filterPlaceHolder: filterPlaceHolder,
                            displayMember: 'text',
                            valueMember: 'value',
                            selectedIndex: 0,
                            width: width,
                            height: 28
                        });
                    }
                }
            });
        }

        if (showAdvancedQuery) {
            $.each(advancedQueryItems, function (i, e) {
                if (e != undefined) {
                    var type = e.type;
                    if ('list' === type) {
                        var options = e.items;
                        var source1 = [];
                        var filterable = true;
                        var filterPlaceHolder = "请输入关键字";
                        if (null != options && options != undefined && options != 'undefined') {
                            $.each(options, function (i, e) {
                                source1.push({text: e.value, value: e.key});
                                if (e.filterable != "undefined" && e.filterable != undefined) {
                                    filterable = e.filterable;
                                }
                                if (e.filterPlaceHolder != "undefined" && e.filterPlaceHolder != undefined) {
                                    filterPlaceHolder = e.filterPlaceHolder;
                                }
                            });
                        }
                        var width = e.width != undefined ? e.width : 150;
                        var divid = "#" + e.key;
                        //TODO 生成drop
                        divid = divid.replace('.', '\\.');
                        $(divid).jqxDropDownList({
                            source: source1,
                            filterable: filterable,
                            filterPlaceHolder: filterPlaceHolder,
                            displayMember: 'text',
                            valueMember: 'value',
                            selectedIndex: 0,
                            width: width,
                            height: 28
                        });
                    }
                }
            });

            if (length && advancedQueryItems.length % 2 === 1) {
                html.push('</tr>');
            }

            html.push('</table>', '<button class="menu_right_but" >搜索</button>', '</div></div>');
        }

        if (this.options.showPaginationSwitch) {
            this.$toolbar.find('button[name="paginationSwitch"]')
                .off('click').on('click', $.proxy(this.togglePagination, this));
        }

        if (this.options.showRefresh) {
            this.$toolbar.find('button[name="refresh"]')
                .off('click').on('click', $.proxy(this.refresh, this));
        }

        if (this.options.showToggle) {
            this.$toolbar.find('button[name="toggle"]')
                .off('click').on('click', function () {
                that.toggleView();
            });
        }

        if (this.options.showAdd) {
            this.$toolbar.find('button[name="add"]')
                .off('click').on('click', function () {
                sessionStorage.removeItem(pageName() + "_search");
                location.href = that.options.addUrl;
            });
        }

        if ('' != this.options.optionBtnTitle_1 && '' != this.options.optionBtnUrl_1 && '' != this.options.optionBtnName_1) {
            this.bindOptionBtn(that, this.options.optionBtnName_1, that.options.optionBtnAllowMulti_1, that.options.optionBtnMultiWarnMsg_1, that.options.optionBtnOpenType_1, that.options.optionBtnUrl_1, that.options.optionBtnWithParam_1, that.options.optionBtnCustomName_1)
        }
        if ('' != this.options.optionBtnTitle_2 && '' != this.options.optionBtnUrl_2 && '' != this.options.optionBtnName_2) {
            this.bindOptionBtn(that, that.options.optionBtnName_2, that.options.optionBtnAllowMulti_2, that.options.optionBtnMultiWarnMsg_2, that.options.optionBtnOpenType_2, that.options.optionBtnUrl_2, that.options.optionBtnWithParam_2, that.options.optionBtnCustomName_2)
        }

        if ('' != this.options.optionBtnTitle_3 && '' != this.options.optionBtnUrl_3 && '' != this.options.optionBtnName_3) {
            this.bindOptionBtn(that, that.options.optionBtnName_3, that.options.optionBtnAllowMulti_3, that.options.optionBtnMultiWarnMsg_3, that.options.optionBtnOpenType_3, that.options.optionBtnUrl_3, that.options.optionBtnWithParam_3, that.options.optionBtnCustomName_3)
        }

        if ('' != this.options.optionBtnTitle_4 && '' != this.options.optionBtnUrl_4 && '' != this.options.optionBtnName_4) {
            this.bindOptionBtn(that, that.options.optionBtnName_4, that.options.optionBtnAllowMulti_4, that.options.optionBtnMultiWarnMsg_4, that.options.optionBtnOpenType_4, that.options.optionBtnUrl_4, that.options.optionBtnWithParam_4, that.options.optionBtnCustomName_4)
        }

        if ('' != this.options.optionBtnTitle_5 && '' != this.options.optionBtnUrl_5 && '' != this.options.optionBtnName_5) {
            this.bindOptionBtn(that, that.options.optionBtnName_5, that.options.optionBtnAllowMulti_5, that.options.optionBtnMultiWarnMsg_5, that.options.optionBtnOpenType_5, that.options.optionBtnUrl_5, that.options.optionBtnWithParam_5, that.options.optionBtnCustomName_5)
        }

        if ('' != this.options.optionBtnTitle_6 && '' != this.options.optionBtnUrl_6 && '' != this.options.optionBtnName_6) {
            this.bindOptionBtn(that, that.options.optionBtnName_6, that.options.optionBtnAllowMulti_6, that.options.optionBtnMultiWarnMsg_6, that.options.optionBtnOpenType_6, that.options.optionBtnUrl_6, that.options.optionBtnWithParam_6, that.options.optionBtnCustomName_6)
        }

        if ('' != this.options.optionBtnTitle_7 && '' != this.options.optionBtnUrl_7 && '' != this.options.optionBtnName_7) {
            this.bindOptionBtn(that, that.options.optionBtnName_7, that.options.optionBtnAllowMulti_7, that.options.optionBtnMultiWarnMsg_7, that.options.optionBtnOpenType_7, that.options.optionBtnUrl_7, that.options.optionBtnWithParam_7, that.options.optionBtnCustomName_7)
        }

        if ('' != this.options.optionBtnTitle_8 && '' != this.options.optionBtnUrl_8 && '' != this.options.optionBtnName_8) {
            this.bindOptionBtn(that, that.options.optionBtnName_8, that.options.optionBtnAllowMulti_8, that.options.optionBtnMultiWarnMsg_8, that.options.optionBtnOpenType_8, that.options.optionBtnUrl_8, that.options.optionBtnWithParam_8, that.options.optionBtnCustomName_8)
        }

        if ('' != this.options.optionBtnTitle_9 && '' != this.options.optionBtnUrl_9 && '' != this.options.optionBtnName_9) {
            this.bindOptionBtn(that, that.options.optionBtnName_9, that.options.optionBtnAllowMulti_9, that.options.optionBtnMultiWarnMsg_9, that.options.optionBtnOpenType_9, that.options.optionBtnUrl_9, that.options.optionBtnWithParam_9, that.options.optionBtnCustomName_9)
        }

        if ('' != this.options.optionBtnTitle_10 && '' != this.options.optionBtnUrl_10 && '' != this.options.optionBtnName_10) {
            this.bindOptionBtn(that, that.options.optionBtnName_10, that.options.optionBtnAllowMulti_10, that.options.optionBtnMultiWarnMsg_10, that.options.optionBtnOpenType_10, that.options.optionBtnUrl_10, that.options.optionBtnWithParam_10, that.options.optionBtnCustomName_10)
        }

        if ('' != this.options.optionBtnTitle_11 && '' != this.options.optionBtnUrl_11 && '' != this.options.optionBtnName_11) {
            this.bindOptionBtn(that, that.options.optionBtnName_11, that.options.optionBtnAllowMulti_11, that.options.optionBtnMultiWarnMsg_11, that.options.optionBtnOpenType_11, that.options.optionBtnUrl_11, that.options.optionBtnWithParam_11, that.options.optionBtnCustomName_11)
        }

        if ('' != this.options.optionBtnTitle_12 && '' != this.options.optionBtnUrl_12 && '' != this.options.optionBtnName_12) {
            this.bindOptionBtn(that, that.options.optionBtnName_12, that.options.optionBtnAllowMulti_12, that.options.optionBtnMultiWarnMsg_12, that.options.optionBtnOpenType_12, that.options.optionBtnUrl_12, that.options.optionBtnWithParam_12, that.options.optionBtnCustomName_12)
        }

        if ('' != this.options.optionBtnTitle_13 && '' != this.options.optionBtnUrl_13 && '' != this.options.optionBtnName_13) {
            this.bindOptionBtn(that, that.options.optionBtnName_13, that.options.optionBtnAllowMulti_13, that.options.optionBtnMultiWarnMsg_13, that.options.optionBtnOpenType_13, that.options.optionBtnUrl_13, that.options.optionBtnWithParam_13, that.options.optionBtnCustomName_13)
        }

        if ('' != this.options.optionBtnTitle_14 && '' != this.options.optionBtnUrl_14 && '' != this.options.optionBtnName_14) {
            this.bindOptionBtn(that, that.options.optionBtnName_14, that.options.optionBtnAllowMulti_14, that.options.optionBtnMultiWarnMsg_14, that.options.optionBtnOpenType_14, that.options.optionBtnUrl_14, that.options.optionBtnWithParam_14, that.options.optionBtnCustomName_14)
        }

        if ('' != this.options.optionBtnTitle_15 && '' != this.options.optionBtnUrl_15 && '' != this.options.optionBtnName_15) {
            this.bindOptionBtn(that, that.options.optionBtnName_15, that.options.optionBtnAllowMulti_15, that.options.optionBtnMultiWarnMsg_15, that.options.optionBtnOpenType_15, that.options.optionBtnUrl_15, that.options.optionBtnWithParam_15, that.options.optionBtnCustomName_15)
        }

        if (this.options.showMultiDelete) {
            this.$toolbar.find('button[name="delete"]')
                .off('click').on('click', function () {
                var selected = that.getAllSelections();
                if (selected.length > 0) {
                    $('#deleteDialog').modal({
                        keyboard: true
                    })
                    $('#deleteDialog').modal('show');

                    $('.btn-primary').off('click').on('click', function () {
                        var searchItems = [];
                        //TODO ADD SEARCH
                        $(".search_item").each(function (i, e) {
                            var searchItem = {};
                            searchItem.key = e.name;
                            searchItem.value = e.value;
                            searchItems.push(searchItem);
                        });
                        $(".adv_search_item").each(function (i, e) {
                            var searchItem = {};
                            searchItem.key = e.name;
                            searchItem.value = e.value;
                            searchItems.push(searchItem);
                        });
                        $(".search_item_tag").each(function (i, e) {
                            var role = $(this).attr("role");
                            var divid = $(this).attr("id");
                            if (role === 'combobox') {
                                var searchItem = {};
                                searchItem.key = $(e).attr("name");
                                searchItem.value = $(this).val();
                                searchItems.push(searchItem);
                            }
                        });
                        $.ajax({
                            url: that.options.multiDeleteUrl,
                            data: {
                                "jsonData": JSON.stringify(selected),
                                "isCheckAllpages": isCheckAllpages,
                                "searchItems": JSON.stringify(searchItems)
                            },
                            type: "POST",
                            contentType: "application/x-www-form-urlencoded",
                            dataType: "json",
                            success: function (msg) {
                                if (msg.status == '-1' && msg.errorCode == '401') {
                                    goToLogin(msg);
                                }
                                $('#deleteDialog').modal('hide');
                                toastr.clear();
                                if (msg.result == false) {
                                    toastr.error(msg.msg);
                                } else {
                                    toastr.success('删除成功');
                                }
                                that.refresh(that.options.url);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                //通常情况下textStatus和errorThrown只有其中一个包含信息
                                toastr.clear();
                                toastr.error('删除失败');
                            }
                        });
                    });
                } else {
                    toastr.clear();
                    toastr.warning('必须至少选中一条纪录');
                }

            });
        }


        if (this.options.showExport) {
            this.$toolbar.find('button[name="export"]')
                .off('click').on('click', function () {
                if ($.isFunction(window.exportFile)) {
                    exportFile();
                } else if (that.options.exportUrl != null && that.options.exportUrl != '') {

                    var selected = that.getAllSelectionIds();
//TODO EXPORT
                    var searchItems = [];
                    $(".search_item").each(function (i, e) {
                        var searchItem = {};
                        searchItem.key = e.name;
                        searchItem.value = e.value;
                        searchItems.push(searchItem);
                    });
                    $(".adv_search_item").each(function (i, e) {
                        var searchItem = {};
                        searchItem.key = e.name;
                        searchItem.value = e.value;
                        searchItems.push(searchItem);
                    });
                    $(".search_item_tag").each(function (i, e) {
                        var role = $(this).attr("role");
                        var divid = $(this).attr("id");
                        if (role === 'combobox') {
                            var searchItem = {};
                            searchItem.key = $(e).attr("name");
                            searchItem.value = $(this).val();
                            searchItems.push(searchItem);
                        }
                    });
                    $.ajax({
                        url: that.options.exportUrl,
                        data: {"searchItems": JSON.stringify(searchItems)},
                        type: "POST",
                        async: false,
                        contentType: "application/x-www-form-urlencoded",
                        dataType: "json",
                        success: function (msg) {
                            if (msg.status == '-1' && msg.errorCode == '401') {
                                goToLogin(msg);
                            }
                            toastr.clear();
                            if (msg.status == '-1') {
                                toastr.error(msg.msg);
                            } else if (msg.status == '0') {
                                window.open(that.options.exportUrl);
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            //通常情况下textStatus和errorThrown只有其中一个包含信息
                            toastr.clear();
                            toastr.error('操作失败');

                        }
                    });


                } else {
                    console.log("未设定导出函数或导出Url");
                }
            });
        }

        if (this.options.showColumns) {
//            $keepOpen = this.$toolbar.find('.but_icon');
//
//            if (switchableCount <= this.options.minimumCountColumns) {
//                $keepOpen.find('input').prop('disabled', true);
//            }
//
//            $keepOpen.find('li').off('click').on('click', function (event) {
//                event.stopImmediatePropagation();
//            });
//            $keepOpen.find('input').off('click').on('click', function () {
//                var $this = $(this);
//
//                that.toggleColumn(getFieldIndex(that.columns,
//                    $(this).data('field')), $this.prop('checked'), false);
//                that.trigger('column-switch', $(this).data('field'), $this.prop('checked'));
//            });
            $keepOpen = this.$toolbar.find('.but_icon');

            var dropDownButton = $keepOpen.find('button[data-toggle="dropdown"]');
            var dropDownList = $keepOpen.find('.xlcd_mod');
            dropDownButton.click(function () {
                if (dropDownList.is(":hidden")) {
                    dropDownList.show();
                } else {
                    dropDownList.hide();
                }
            });

            if (switchableCount <= this.options.minimumCountColumns) {
                $keepOpen.find('input').prop('disabled', true);
            }

            $keepOpen.find('li').off('click').on('click', function (event) {
                event.stopImmediatePropagation();
            });
            $keepOpen.find('input').off('click').on('click', function () {
                var $this = $(this);

                that.toggleColumn(getFieldIndex(that.columns,
                    $(this).data('field')), $this.prop('checked'), false);
                that.trigger('column-switch', $(this).data('field'), $this.prop('checked'));
            });
        }

        if (this.options.search) {
            $search = $("#zzos_search_btn");
            $search.on('click', function (event) {
                $(".error_date").each(function () {
                    $(this).remove();
                });
                //校验日期后一个输入框时间大于前一个输入框值
                var checkDate = true;
                $("input[id^='toDate']").each(function () {
                    if ($(this).val() != "") {
                        if ($(this).val() < $(this).prev("input").val()) {
                            checkDate = false;
                            $(this).after('<span class="error_date"><br/><span style="color: red">后一个输入框的时间必须大于前一个输入框的时间</span></span>');
                            $("#zzos_search_btn").after('<span class="error_date"><span style="color: red">高级搜索时间条件有误</span></span>');
                        }
                    }
                });
                if (checkDate) {
                    that.onSearch(event)
                }
            });

            $search = $("#zzos_search_btn_gj");
            $search.on('click', function (event) {
                $(".error_date").each(function () {
                    $(this).remove();
                });
                //校验日期后一个输入框时间大于前一个输入框值
                var checkDate = true;
                $("input[id^='toDate']").each(function () {
                    if ($(this).val() != "") {
                        if ($(this).val() < $(this).prev("input").val()) {
                            checkDate = false;
                            $(this).after('<span class="error_date"><br/><span style="color: red">后一个输入框的时间必须大于前一个输入框的时间</span></span>');
                            $("#zzos_search_btn").after('<span class="error_date"><span style="color: red">高级搜索时间条件有误</span></span>');
                        }
                    }
                });
                if (checkDate) {
                    that.onSearch(event)
                }
            });


            $advSearchBtn = $("#zzos_adv_search_btn");
            var advSearchDiv;
            advSearchDiv = $("#adv_search_div");
            $advSearchBtn.on('click', function (event) {
                if (advSearchDiv.is(":hidden")) {
                    $(advSearchDiv).css("display", "table");
                } else {
                    $(advSearchDiv).hide();
                }
            });
        }
    };

    BootstrapTable.prototype.bindOptionBtn = function (that, optionBtnName, optionBtnAllowMulti, optionBtnMultiWarnMsg, optionBtnOpenType, optionBtnUrl, optionBtnWithParam, optionBtnCustomName) {
        this.$toolbar.find('button[name="' + optionBtnName + '"]')
            .off('click').on('click', function () {
            var searchItems = [];
            $(".search_item").each(function (i, e) {
                var searchItem = {};
                searchItem.key = e.name;
                searchItem.value = e.value;
                searchItems.push(searchItem);
            });
            $(".adv_search_item").each(function (i, e) {
                var searchItem = {};
                searchItem.key = e.name;
                searchItem.value = e.value;
                searchItems.push(searchItem);
            });
            $(".search_item_tag").each(function (i, e) {
                var role = $(this).attr("role");
                var divid = $(this).attr("id");
                if (role === 'combobox') {
                    var searchItem = {};
                    searchItem.key = $(e).attr("name");
                    searchItem.value = $(this).val();
                    searchItems.push(searchItem);
                }
            });
            var selected = that.getAllSelections();

            var divid = "#" + optionBtnName + "Dialog";
            if (selected.length > 1 && !optionBtnAllowMulti) {
                toastr.warning(optionBtnMultiWarnMsg);
            } else {
                if ("_blank" === optionBtnOpenType) {
                    if (optionBtnWithParam) {
                        var ids = that.getAllSelectionIds();
                        if (ids == null || ids == "") {
                            toastr.clear();
                            toastr.warning('必须至少选中一条纪录');
                        } else {
                            location.href = optionBtnUrl + "/" + ids;
                        }
                    } else {
                        location.href = optionBtnUrl;
                    }

                } else if ("_custom" == optionBtnOpenType) {
                    var ids = that.getAllSelectionIds();
                    eval(optionBtnCustomName + "('" + selected + "','" + ids + "','" + isCheckAllpages + "','" + JSON.stringify(searchItems) + "')");
                } else {
                    if (selected.length > 0) {
                        if ($(divid).length <= 0) {
                            $(".mod_box").append('<div class="modal fade" id="' + optionBtnName + 'Dialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">');
                            $(divid).append('<div class="modal-dialog" style="width: 350px;"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
                                '<h4 class="modal-title" id="myModalLabel">系统提示</h4></div><div class="modal-body">是否确定要操作指定记录？</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">返回</button>' +
                                '<button type="button" class="btn btn-primary">确定</button></div></div></div>');
                        }
                        $(divid).modal({
                            keyboard: true
                        })
                        $(divid).modal('show');
                        $('.btn-primary').off('click').on('click', function () {
                            $.ajax({
                                url: optionBtnUrl,
                                data: {
                                    "jsonData": JSON.stringify(selected),
                                    "isCheckAllpages": isCheckAllpages,
                                    "searchItems": JSON.stringify(searchItems)
                                },
                                type: "POST",
                                contentType: "application/x-www-form-urlencoded",
                                dataType: "json",
                                success: function (msg) {
                                    if (msg.status == '-1' && msg.errorCode == '401') {
                                        goToLogin(msg);
                                    }
                                    $(divid).modal('hide');
                                    toastr.clear();
                                    if (msg.result == false) {
                                        toastr.error(msg.msg);
                                    } else if (msg.result == true) {
                                        toastr.success(msg.msg);
                                    } else {
                                        toastr.success('操作成功');
                                    }
                                    that.refresh(that.options.url);
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    //通常情况下textStatus和errorThrown只有其中一个包含信息
                                    toastr.clear();
                                    toastr.error('操作失败');

                                }
                            });

                        });
                    } else {
                        toastr.clear();
                        toastr.warning('必须至少选中一条纪录');
                    }
                }
            }
        });
    }

    BootstrapTable.prototype.onSearch = function (event) {

        var searchItems = [];

        $(".search_item").each(function (i, e) {
            var searchItem = {};
            searchItem.key = e.name;
            searchItem.value = e.value;
            searchItems.push(searchItem);
        });

        // if(!$('#adv_search_div').is(":hidden")){
        $('#adv_search_div').hide();
        $(".adv_search_item").each(function (i, e) {
            var searchItem = {};
            searchItem.key = e.name;
            searchItem.value = e.value;
            searchItems.push(searchItem);
        });
        //  }

        $(".search_item_tag").each(function (i, e) {
            var role = $(this).attr("role");
            var divid = $(this).attr("id");
            if (role === 'combobox') {
                var searchItem = {};
                searchItem.key = $(e).attr("name");
                searchItem.value = $(this).val();
                searchItems.push(searchItem);
            }
        });

        this.searchText = JSON.stringify(searchItems);

        sessionStorage.setItem(pageName() + "_search", this.searchText);

        this.options.pageNumber = 1;
        this.refresh(this.options.url);

    };

    function pageName() {
        var location = (window.location + '').split('/');
        var basePath = location[4];
        return basePath;
    }

    BootstrapTable.prototype.initSearch = function () {
        var that = this;

        if (this.options.sidePagination !== 'server') {
            var s = this.searchText && this.searchText.toLowerCase();
            var f = $.isEmptyObject(this.filterColumns) ? null : this.filterColumns;

            // Check filter
            this.data = f ? $.grep(this.options.data, function (item, i) {
                for (var key in f) {
                    if (item[key] !== f[key]) {
                        return false;
                    }
                }
                return true;
            }) : this.options.data;

            this.data = s ? $.grep(this.data, function (item, i) {
                for (var key in item) {
                    key = $.isNumeric(key) ? parseInt(key, 10) : key;
                    var value = item[key],
                        column = that.columns[getFieldIndex(that.columns, key)],
                        j = $.inArray(key, that.header.fields);

                    // Fix #142: search use formated data
                    if (column && column.searchFormatter) {
                        value = calculateObjectValue(column,
                            that.header.formatters[j], [value, item, i], value);
                    }

                    var index = $.inArray(key, that.header.fields);
                    if (index !== -1 && that.header.searchables[index] && (typeof value === 'string' || typeof value === 'number')) {
                        if (that.options.strictSearch) {
                            if ((value + '').toLowerCase() === s) {
                                return true;
                            }
                        } else {
                            if ((value + '').toLowerCase().indexOf(s) !== -1) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }) : this.data;
        }
    };

    BootstrapTable.prototype.initPagination = function () {
        if (!this.options.pagination) {
            this.$pagination.hide();
            return;
        } else {
            this.$pagination.show();
        }

        var that = this,
            html = [],
            $allSelected = false,
            i, from, to,
            $pageList,
            $first, $pre,
            $next, $last,
            $number,
            data = this.getData();
        if (this.options.sidePagination !== 'server') {
            this.options.totalRows = data.length;
        }

        this.totalPages = 0;
        if (this.options.totalRows) {
            if (this.options.pageSize === this.options.formatAllRows()) {
                this.options.pageSize = this.options.totalRows;
                $allSelected = true;
            } else if (this.options.pageSize === this.options.totalRows) {
                // Fix #667 Table with pagination,
                // multiple pages and a search that matches to one page throws exception

                var pageLst = typeof this.options.pageList === 'string' ?
                    this.options.pageList.replace('[', '').replace(']', '')
                        .replace(/ /g, '').toLowerCase().split(',') : this.options.pageList;
                pageLst = JSON.stringify(pageLst);
                if (pageLst.indexOf(this.options.formatAllRows().toLowerCase()) > -1) {
                    $allSelected = true;
                }
            }

            this.totalPages = ~~((this.options.totalRows - 1) / this.options.pageSize) + 1;

            this.options.totalPages = this.totalPages;
        }
        if (this.totalPages > 0 && this.options.pageNumber > this.totalPages) {
            this.options.pageNumber = this.totalPages;
        }

        this.pageFrom = (this.options.pageNumber - 1) * this.options.pageSize + 1;
        this.pageTo = this.options.pageNumber * this.options.pageSize;
        if (this.pageTo > this.options.totalRows) {
            this.pageTo = this.options.totalRows;
        }

        html.push(
            '<div class="pull-' + this.options.paginationDetailHAlign + ' pagination-detail">',
            '<span class="pagination-info">',
            this.options.formatShowingRows(this.pageFrom, this.pageTo, this.options.totalRows),
            '</span>');

        html.push('<span class="page-list">');

        var pageNumber = [
                sprintf('<span class="btn-group %s">',
                    this.options.paginationVAlign === 'top' || this.options.paginationVAlign === 'both' ?
                        'dropdown' : 'dropup'),
                '<button type="button" class="btn btn-default bootstrap-page-index' +
                (this.options.iconSize === undefined ? '' : ' btn-' + this.options.iconSize) +
                ' dropdown-toggle" data-toggle="dropdown">',
                '<span class="page-size">',
                $allSelected ? this.options.formatAllRows() : this.options.pageSize,
                '</span>',
                ' <span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu" role="menu">'
            ],
            pageList = this.options.pageList;

        if (typeof this.options.pageList === 'string') {
            var list = this.options.pageList.replace('[', '').replace(']', '')
                .replace(/ /g, '').split(',');

            pageList = [];
            $.each(list, function (i, value) {
                pageList.push(value.toUpperCase() === that.options.formatAllRows().toUpperCase() ?
                    that.options.formatAllRows() : +value);
            });
        }

        $.each(pageList, function (i, page) {
            if (!that.options.smartDisplay || i === 0 || pageList[i - 1] <= that.options.totalRows) {
                var active;
                if ($allSelected) {
                    active = page === that.options.formatAllRows() ? ' class="active"' : '';
                } else {
                    active = page === that.options.pageSize ? ' class="active"' : '';
                }
                pageNumber.push(sprintf('<li%s><a href="javascript:void(0)">%s</a></li>', active, page));
            }
        });
        pageNumber.push('</ul></span>');

        html.push(this.options.formatRecordsPerPage(pageNumber.join('')));
        html.push('</span>');

        html.push('</div>',
            '<div class="pull-' + this.options.paginationHAlign + ' pagination">',
            '<ul class="pagination' + (this.options.iconSize === undefined ? '' : ' pagination-' + this.options.iconSize) + '">',
            '<li class="page-first"><a href="javascript:void(0)">' + this.options.paginationFirstText + '</a></li>',
            '<li class="page-pre"><a href="javascript:void(0)">' + this.options.paginationPreText + '</a></li>');

        if (this.totalPages < 5) {
            from = 1;
            to = this.totalPages;
        } else {
            from = this.options.pageNumber - 2;
            to = from + 4;
            if (from < 1) {
                from = 1;
                to = 5;
            }
            if (to > this.totalPages) {
                to = this.totalPages;
                from = to - 4;
            }
        }
        for (i = from; i <= to; i++) {
            html.push('<li class="page-number' + (i === parseInt(this.options.pageNumber) ? ' active' : '') + '">',
                '<a href="javascript:void(0)">', i, '</a>',
                '</li>');
        }
        html.push(
            '<li class="page-next"><a href="javascript:void(0)">' + this.options.paginationNextText + '</a></li>',
            '<li class="page-last"><a href="javascript:void(0)">' + this.options.paginationLastText + '</a></li>',
            '</ul>',
            '</div>');


        var selStr;

        if (isCheckAllpages) {
            selStr = '<ul class="select_all"><li><label><input  name="btSelectAll" id="btSelectAll" type="checkbox" checked="' + (isCheckAllpages === true) + '" class="checkbox_width">全选本页</label></li>'
        } else {
            selStr = '<ul class="select_all"><li><label><input  name="btSelectAll" id="btSelectAll" type="checkbox"  class="checkbox_width">全选本页</label></li>'
        }
        //TODO
        if (that.options.showSelectAll == "true") {
            if (isCheckAllpages) {
                selStr = selStr + '<li> <label><input name="btSelectAllPages" id="btSelectAllPages" type="checkbox" checked="' + (isCheckAllpages === true) + '" value="' + (isCheckAllpages === true) + '" class="checkbox_width">全选所有页</label> </li>';
            } else {
                selStr = selStr + '<li> <label><input name="btSelectAllPages" id="btSelectAllPages" type="checkbox"  value="' + (isCheckAllpages === true) + '" class="checkbox_width">全选所有页</label> </li>';
            }
        }
        selStr = selStr + '</ul>';


        this.$pagination.html(selStr + ' ' + html.join(''));

        $pageList = this.$pagination.find('.page-list a');
        $first = this.$pagination.find('.page-first');
        $pre = this.$pagination.find('.page-pre');
        $next = this.$pagination.find('.page-next');
        $last = this.$pagination.find('.page-last');
        $number = this.$pagination.find('.page-number');

        if (this.options.pageNumber <= 1) {
            $first.addClass('disabled');
            $pre.addClass('disabled');
        }
        if (this.options.pageNumber >= this.totalPages) {
            $last.addClass('active');
            $next.addClass('disabled');
            $last.addClass('disabled');
        }
        if (this.options.smartDisplay) {
            if (this.totalPages <= 1) {
                this.$pagination.find('div.pagination').hide();
            }
            if (pageList.length < 2 || this.options.totalRows <= pageList[0]) {
                this.$pagination.find('span.page-list').hide();
            }

            // when data is empty, hide the pagination
            this.$pagination[this.getData().length ? 'show' : 'hide']();
        }
        if ($allSelected) {
            this.options.pageSize = this.options.formatAllRows();
        }
        $pageList.off('click').on('click', $.proxy(this.onPageListChange, this));
        $first.off('click').on('click', $.proxy(this.onPageFirst, this));
        $pre.off('click').on('click', $.proxy(this.onPagePre, this));
        $next.off('click').on('click', $.proxy(this.onPageNext, this));
        $last.off('click').on('click', $.proxy(this.onPageLast, this));
        $number.off('click').on('click', $.proxy(this.onPageNumber, this));
    };

    BootstrapTable.prototype.updatePagination = function (event) {
        // Fix #171: IE disabled button can be clicked bug.
        if (event && $(event.currentTarget).hasClass('disabled')) {
            return;
        }

        if (!this.options.maintainSelected) {
            this.resetRows();
        }

        this.initPagination();
        if (this.options.sidePagination === 'server') {
            this.initServer();
        } else {
            this.initBody();
        }
        this.trigger('page-change', this.options.pageNumber, this.options.pageSize);
    };

    BootstrapTable.prototype.onPageListChange = function (event) {
        var $this = $(event.currentTarget);

        $this.parent().addClass('active').siblings().removeClass('active');
        this.options.pageSize = $this.text().toUpperCase() === this.options.formatAllRows().toUpperCase() ?
            this.options.formatAllRows() : +$this.text();
        this.$toolbar.find('.page-size').text(this.options.pageSize);

        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageFirst = function (event) {
        this.options.pageNumber = 1;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPagePre = function (event) {
        this.options.pageNumber--;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageNext = function (event) {
        this.options.pageNumber++;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageLast = function (event) {
        this.options.pageNumber = this.totalPages;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageNumber = function (event) {
        if (this.options.pageNumber === +$(event.currentTarget).text()) {
            return;
        }
        this.options.pageNumber = +$(event.currentTarget).text();
        this.updatePagination(event);
    };

    BootstrapTable.prototype.initBody = function (fixedScroll) {

        var that = this,
            html = [],
            data = this.getData();

        this.trigger('pre-body', data);

        this.$body = this.$el.find('tbody');
        if (!this.$body.length) {
            this.$body = $('<tbody></tbody>').appendTo(this.$el);
        }

        //Fix #389 Bootstrap-table-flatJSON is not working

        if (!this.options.pagination || this.options.sidePagination === 'server') {
            this.pageFrom = 1;
            this.pageTo = data.length;
        }

        for (var i = this.pageFrom - 1; i < this.pageTo; i++) {
            var key,
                item = data[i],
                style = {},
                csses = [],
                data_ = '',
                attributes = {},
                htmlAttributes = [];

            style = calculateObjectValue(this.options, this.options.rowStyle, [item, i], style);

            if (style && style.css) {
                for (key in style.css) {
                    csses.push(key + ': ' + style.css[key]);
                }
            }

            attributes = calculateObjectValue(this.options,
                this.options.rowAttributes, [item, i], attributes);

            if (attributes) {
                for (key in attributes) {
                    htmlAttributes.push(sprintf('%s="%s"', key, escapeHTML(attributes[key])));
                }
            }

            if (item._data && !$.isEmptyObject(item._data)) {
                $.each(item._data, function (k, v) {
                    // ignore data-index
                    if (k === 'index') {
                        return;
                    }
                    data_ += sprintf(' data-%s="%s"', k, v);
                });
            }

            html.push('<tr',
                sprintf(' %s', htmlAttributes.join(' ')),
                sprintf(' id="%s"', $.isArray(item) ? undefined : item._id),
                sprintf(' class="%s"', style.classes || ($.isArray(item) ? undefined : item._class)),
                sprintf(' data-index="%s"', i),
                sprintf(' data-uniqueid="%s"', item[this.options.uniqueId]),
                sprintf('%s', data_),
                '>'
            );

            if (this.options.cardView) {
                html.push(sprintf('<td colspan="%s">', this.header.fields.length));
            }

            if (!this.options.cardView && this.options.detailView) {
                html.push('<td>',
                    '<a class="detail-icon" href="javascript:">',
                    sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.detailOpen),
                    '</a>',
                    '</td>');
            }

            $.each(this.header.fields, function (j, field) {
                var text = '',
                    type = '',
                    cellStyle = {},
                    id_ = '',
                    class_ = that.header.classes[j],
                    data_ = '',
                    rowspan_ = '',
                    title_ = '',
                    column = that.columns[getFieldIndex(that.columns, field)];

                // 添加复杂JSON解析逻辑
                var properties = field.split(".");
                var value;
                for (var x = 0, y = properties.length; x < y; x++) {
                    value = x == 0 ? item[properties[0]] : value[properties[x]] == null ? "" : value[properties[x]];
                }

                if (!column.visible) {
                    return;
                }

                style = sprintf('style="%s"', csses.concat(that.header.styles[j]).join('; '));
                value = calculateObjectValue(column,
                    that.header.formatters[j], [value, item, i], value);


                // handle td's id and class
                if (item['_' + field + '_id']) {
                    id_ = sprintf(' id="%s"', item['_' + field + '_id']);
                }
                if (item['_' + field + '_class']) {
                    class_ = sprintf(' class="%s"', item['_' + field + '_class']);
                }
                if (item['_' + field + '_rowspan']) {
                    rowspan_ = sprintf(' rowspan="%s"', item['_' + field + '_rowspan']);
                }
                if (item['_' + field + '_title']) {
                    title_ = sprintf(' title="%s"', item['_' + field + '_title']);
                }
                cellStyle = calculateObjectValue(that.header,
                    that.header.cellStyles[j], [value, item, i], cellStyle);
                if (cellStyle.classes) {
                    class_ = sprintf(' class="%s"', cellStyle.classes);
                }
                if (cellStyle.css) {
                    var csses_ = [];
                    for (var key in cellStyle.css) {
                        csses_.push(key + ': ' + cellStyle.css[key]);
                    }
                    style = sprintf('style="%s"', csses_.concat(that.header.styles[j]).join('; '));
                }

                if (item['_' + field + '_data'] && !$.isEmptyObject(item['_' + field + '_data'])) {
                    $.each(item['_' + field + '_data'], function (k, v) {
                        // ignore data-index
                        if (k === 'index') {
                            return;
                        }
                        data_ += sprintf(' data-%s="%s"', k, v);
                    });
                }
                //TODO
                if (column.checkbox || column.radio) {
                    type = column.checkbox ? 'checkbox' : type;
                    type = column.radio ? 'radio' : type;

                    text = [that.options.cardView ?
                        '<div class="card-view">' : '<td class="bs-checkbox">',
                        '<input' +
                        sprintf(' class="checkbox_width" data-index="%s"', i) +
                        sprintf(' name="%s"', that.options.selectItemName) +
                        sprintf(' type="%s"', type) +
                        sprintf(' value="%s"', item[that.options.idField]) +
                        sprintf(' checked="%s"', isCheckAllpages === true || value === true ||
                        (value && value.checked) ? 'checked' : undefined) +
                        sprintf(' disabled="%s"', !column.checkboxEnabled ||
                        (value && value.disabled) ? 'disabled' : undefined) +
                        ' />',
                        that.options.cardView ? '</div>' : '</td>'
                    ].join('');

                    item[that.header.stateField] = value === true || (value && value.checked);
                } else {
                    value = typeof value === 'undefined' || value === null ?
                        that.options.undefinedText : value;

                    text = that.options.cardView ? ['<div class="card-view">',
                        that.options.showHeader ? sprintf('<span class="title" %s>%s</span>', style,
                            getPropertyFromOther(that.columns, 'field', 'title', field)) : '',
                        sprintf('<span class="value">%s</span>', value),
                        '</div>'
                    ].join('') : [sprintf('<td%s %s %s %s %s %s>', id_, class_, style, data_, rowspan_, title_),
                        value,
                        '</td>'
                    ].join('');
                    // Hide empty data on Card view when smartDisplay is set to true.
                    if (that.options.cardView && that.options.smartDisplay && value === '') {
                        text = '';
                    }
                }

                html.push(text);
            });

            if (this.options.cardView) {
                html.push('</td>');
            }

            html.push('</tr>');
        }

        // show no records
        if (!html.length) {
            html.push('<tr class="no-records-found">',
                sprintf('<td colspan="%s">%s</td>',
                    this.$header.find('th').length, this.options.formatNoMatches()),
                '</tr>');
        }

        this.$body.html(html.join(''));

        if (!fixedScroll) {
            this.scrollTo(0);
        }

        // click to select by column
        this.$body.find('> tr[data-index] > td').off('click dblclick').on('click dblclick', function (e) {
            var $td = $(this),
                $tr = $td.parent(),
                item = that.data[$tr.data('index')],
                index = $td[0].cellIndex,
                field = that.header.fields[that.options.detailView && !that.options.cardView ? index - 1 : index],
                colomn = that.columns[getFieldIndex(that.columns, field)],
                value = item[field];

            if ($td.find('.detail-icon').length) {
                return;
            }

            that.trigger(e.type === 'click' ? 'click-cell' : 'dbl-click-cell', field, value, item, $td);
            that.trigger(e.type === 'click' ? 'click-row' : 'dbl-click-row', item, $tr);

            // if click to select - then trigger the checkbox/radio click
            if (e.type === 'click' && that.options.clickToSelect && colomn.clickToSelect) {
                var $selectItem = $tr.find(sprintf('[name="%s"]', that.options.selectItemName));
                if ($selectItem.length) {
                    $selectItem[0].click(); // #144: .trigger('click') bug
                }
            }
        });

        this.$body.find('> tr[data-index] > td > .detail-icon').off('click').on('click', function () {
            var $this = $(this),
                $tr = $this.parent().parent(),
                index = $tr.data('index'),
                row = data[index]; // Fix #980 Detail view, when searching, returns wrong row

            // remove and update
            if ($tr.next().is('tr.detail-view')) {
                $this.find('i').attr('class', sprintf('%s %s', that.options.iconsPrefix, that.options.icons.detailOpen));
                $tr.next().remove();
                that.trigger('collapse-row', index, row);
            } else {
                $this.find('i').attr('class', sprintf('%s %s', that.options.iconsPrefix, that.options.icons.detailClose));
                $tr.after(sprintf('<tr class="detail-view"><td colspan="%s">%s</td></tr>',
                    $tr.find('td').length, calculateObjectValue(that.options,
                        that.options.detailFormatter, [index, row], '')));
                that.trigger('expand-row', index, row, $tr.next().find('td'));
            }
            that.resetView();
        });

        this.$selectItem = this.$body.find(sprintf('[name="%s"]', this.options.selectItemName));
        this.$selectItem.off('click').on('click', function (event) {
            event.stopImmediatePropagation();
            $("#btSelectAllPages").prop("checked", false);
            isCheckAllpages = false;
            var checked = $(this).prop('checked'),
                row = that.data[$(this).data('index')];

            row[that.header.stateField] = checked;

            if (that.options.singleSelect) {
                that.$selectItem.not(this).each(function () {
                    that.data[$(this).data('index')][that.header.stateField] = false;
                });
                that.$selectItem.filter(':checked').not(this).prop('checked', false);
            }

            that.updateSelected();
            that.trigger(checked ? 'check' : 'uncheck', row);
        });

        $.each(this.header.events, function (i, events) {
            if (!events) {
                return;
            }
            // fix bug, if events is defined with namespace
            if (typeof events === 'string') {
                events = calculateObjectValue(null, events);
            }

            var field = that.header.fields[i],
                fieldIndex = $.inArray(field, that.getVisibleFields());

            if (that.options.detailView && !that.options.cardView) {
                fieldIndex += 1;
            }

            for (var key in events) {
                that.$body.find('tr').each(function () {
                    var $tr = $(this),
                        $td = $tr.find(that.options.cardView ? '.card-view' : 'td').eq(fieldIndex),
                        index = key.indexOf(' '),
                        name = key.substring(0, index),
                        el = key.substring(index + 1),
                        func = events[key];

                    $td.find(el).off(name).on(name, function (e) {
                        var index = $tr.data('index'),
                            row = that.data[index],
                            value = row[field];

                        func.apply(this, [e, value, row, index]);
                    });
                });
            }
        });

        this.updateSelected();
        this.resetView();

        this.trigger('post-body');
    };

    BootstrapTable.prototype.initServer = function (silent, query) {

        var storage_text = sessionStorage.getItem(pageName() + "_search");
        if (storage_text != null) {
            this.searchText = storage_text;
        }

        var that = this,
            data = {},
            params = {
                pageSize: this.options.pageSize === this.options.formatAllRows() ?
                    this.options.totalRows : this.options.pageSize,
                pageNumber: this.options.pageNumber,
                searchText: this.searchText,
                sortName: this.options.sortName,
                sortOrder: this.options.sortOrder
            },
            request;

        if (!this.options.url && !this.options.ajax) {
            return;
        }

        if (this.options.queryParamsType === 'limit') {
            params = {
                search: params.searchText,
                sort: params.sortName,
                order: params.sortOrder
            };
            if (this.options.pagination) {
                params.limit = this.options.pageSize === this.options.formatAllRows() ?
                    this.options.totalRows : this.options.pageSize;
                params.offset = this.options.pageSize === this.options.formatAllRows() ?
                    0 : this.options.pageSize * (this.options.pageNumber - 1);
            }
        }

        if (!($.isEmptyObject(this.filterColumnsPartial))) {
            params['filter'] = JSON.stringify(this.filterColumnsPartial, null);
        }

        data = calculateObjectValue(this.options, this.options.queryParams, [params], data);

        $.extend(data, query || {});

        // false to stop request
        if (data === false) {
            return;
        }

        if (!silent) {
            this.$tableLoading.show();
        }
        request = $.extend({}, calculateObjectValue(null, this.options.ajaxOptions), {
            type: this.options.method,
            url: this.options.url,
            data: this.options.contentType === 'application/json' && this.options.method === 'post' ?
                JSON.stringify(data) : data,
            cache: this.options.cache,
            contentType: this.options.contentType,
            dataType: this.options.dataType,
            success: function (res) {
                if (res.status == '-1' && res.errorCode == '401') {
                    goToLogin(res);
                }
                res = calculateObjectValue(that.options, that.options.responseHandler, [res], res);

                that.load(res);
                that.trigger('load-success', res);
                if (res.search != null && res.search != "" && res.search != "undefind") {
                    eval("data=" + res.search);
                    for (var i = 0; i < data.length; i++) {
                        $("input[name='" + data[i].key + "']").val(data[i].value);
                        $("div[name='" + data[i].key + "']").val(data[i].value);
                        $("textarea[name='" + data[i].key + "']").val(data[i].value);
                    }
                }
                if (res.responseInfo != null && res.responseInfo != "" && res.responseInfo != "undefind") {
                    eval("data=" + res.responseInfo);
                    for (var i = 0; i < data.length; i++) {
                        $("span[name='" + data[i].key + "']").html(data[i].value);
                    }
                }
            },
            error: function (res) {
                that.trigger('load-error', res.status);
            },
            complete: function () {
                if (!silent) {
                    that.$tableLoading.hide();
                }
            }
        });

        if (this.options.ajax) {
            calculateObjectValue(this, this.options.ajax, [request], null);
        } else {
            $.ajax(request);
        }
    };

    BootstrapTable.prototype.getCaret = function () {
        var that = this;

        $.each(this.$header.find('th'), function (i, th) {
            $(th).find('.sortable').removeClass('desc asc').addClass($(th).data('field') === that.options.sortName ? that.options.sortOrder : 'both');
        });
    };

    BootstrapTable.prototype.updateSelected = function () {
        var checkAll = this.$selectItem.filter(':enabled').length ===
            this.$selectItem.filter(':enabled').filter(':checked').length;

        this.$selectAll.add(this.$selectAll_).prop('checked', checkAll);

        this.$selectItem.each(function () {
            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected');
        });
    };

    BootstrapTable.prototype.updateRows = function () {
        var that = this;

        this.$selectItem.each(function () {
            that.data[$(this).data('index')][that.header.stateField] = $(this).prop('checked');
        });
    };

    BootstrapTable.prototype.resetRows = function () {
        var that = this;

        $.each(this.data, function (i, row) {
            that.$selectAll.prop('checked', false);
            that.$selectItem.prop('checked', false);
            if (that.header.stateField) {
                row[that.header.stateField] = false;
            }
        });
    };

    BootstrapTable.prototype.trigger = function (name) {
        var args = Array.prototype.slice.call(arguments, 1);

        name += '.bs.table';
        this.options[BootstrapTable.EVENTS[name]].apply(this.options, args);
        this.$el.trigger($.Event(name), args);

        this.options.onAll(name, args);
        this.$el.trigger($.Event('all.bs.table'), [name, args]);
    };

    BootstrapTable.prototype.resetHeader = function () {
        // fix #61: the hidden table reset header bug.
        // fix bug: get $el.css('width') error sometime (height = 500)
        clearTimeout(this.timeoutId_);
        this.timeoutId_ = setTimeout($.proxy(this.fitHeader, this), this.$el.is(':hidden') ? 100 : 0);
    };

    BootstrapTable.prototype.fitHeader = function () {
        var that = this,
            fixedBody,
            scrollWidth;

        if (that.$el.is(':hidden')) {
            that.timeoutId_ = setTimeout($.proxy(that.fitHeader, that), 100);
            return;
        }
        fixedBody = this.$tableBody.get(0);

        scrollWidth = fixedBody.scrollWidth > fixedBody.clientWidth &&
        fixedBody.scrollHeight > fixedBody.clientHeight + this.$header.outerHeight() ?
            getScrollBarWidth() : 0;

        this.$el.css('margin-top', -this.$header.outerHeight());
        this.$header_ = this.$header.clone(true, true);
        this.$selectAll_ = this.$header_.find('[name="btSelectAll"]');
        this.$tableHeader.css({
            'margin-right': scrollWidth
        }).find('table').css('width', this.$el.outerWidth())
            .html('').attr('class', this.$el.attr('class'))
            .append(this.$header_);

        // fix bug: $.data() is not working as expected after $.append()
        this.$header.find('th[data-field]').each(function (i) {
            that.$header_.find(sprintf('th[data-field="%s"]', $(this).data('field'))).data($(this).data());
        });

        var visibleFields = this.getVisibleFields();

        this.$body.find('tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this),
                index = i;

            if (that.options.detailView && !that.options.cardView) {
                if (i === 0) {
                    that.$header_.find('th.detail').find('.fht-cell').width($this.innerWidth());
                }
                index = i - 1;
            }

            that.$header_.find(sprintf('th[data-field="%s"]', visibleFields[index]))
                .find('.fht-cell').width($this.innerWidth());
        });
        // horizontal scroll event
        this.$tableBody.off('scroll').on('scroll', function () {
            that.$tableHeader.scrollLeft($(this).scrollLeft());

            if (this.options.showFooter && !this.options.cardView) {
                that.$tableFooter.scrollLeft($(this).scrollLeft());
            }
        });
        that.trigger('post-header');
    };

    BootstrapTable.prototype.resetFooter = function () {
        var that = this,
            data = that.getData(),
            html = [];

        if (!this.options.showFooter || this.options.cardView) { //do nothing
            return;
        }

        if (!this.options.cardView && this.options.detailView) {
            html.push('<td></td>');
        }

        $.each(this.columns, function (i, column) {
            var falign = '', // footer align style
                style = '',
                class_ = sprintf(' class="%s"', column['class']);

            if (!column.visible) {
                return;
            }

            if (that.options.cardView && (!column.cardVisible)) {
                return;
            }

            falign = sprintf('text-align: %s; ', column.falign ? column.falign : column.align);
            style = sprintf('vertical-align: %s; ', column.valign);

            html.push('<td', class_, sprintf(' style="%s"', falign + style), '>');

            html.push(calculateObjectValue(column, column.footerFormatter, [data], '&nbsp;') || '&nbsp;');
            html.push('</td>');
        });

        this.$tableFooter.find('tr').html(html.join(''));
        clearTimeout(this.timeoutFooter_);
        this.timeoutFooter_ = setTimeout($.proxy(this.fitFooter, this),
            this.$el.is(':hidden') ? 100 : 0);
    };

    BootstrapTable.prototype.fitFooter = function () {
        var that = this,
            $footerTd,
            elWidth,
            scrollWidth;

        clearTimeout(this.timeoutFooter_);
        if (this.$el.is(':hidden')) {
            this.timeoutFooter_ = setTimeout($.proxy(this.fitFooter, this), 100);
            return;
        }

        elWidth = this.$el.css('width');
        scrollWidth = elWidth > this.$tableBody.width() ? getScrollBarWidth() : 0;

        this.$tableFooter.css({
            'margin-right': scrollWidth
        }).find('table').css('width', elWidth)
            .attr('class', this.$el.attr('class'));

        $footerTd = this.$tableFooter.find('td');

        this.$tableBody.find('tbody tr:first-child:not(.no-records-found) > td').each(function (i) {
            $footerTd.eq(i).outerWidth($(this).outerWidth());
        });
    };

    BootstrapTable.prototype.toggleColumn = function (index, checked, needUpdate) {
        if (index === -1) {
            return;
        }
        this.columns[index].visible = checked;
        this.initHeader();
        this.initSearch();
        this.initPagination();
        this.initBody();

        if (this.options.showColumns) {
            var $items = this.$toolbar.find('.but_icon input').prop('disabled', false);

            if (needUpdate) {
                $items.filter(sprintf('[value="%s"]', index)).prop('checked', checked);
            }

            if ($items.filter(':checked').length <= this.options.minimumCountColumns) {
                $items.filter(':checked').prop('disabled', true);
            } else if ($items.filter(':checked').length >= this.options.maxmumCountColumns) {
                $items.filter(function (index) {
                    return $(this).attr("checked") === undefined;
                }).prop('disabled', true);
            }


        }
    };

    BootstrapTable.prototype.toggleRow = function (index, isIdField, visible) {
        if (index === -1) {
            return;
        }

        $(this.$body[0]).children().filter(sprintf(isIdField ? '[data-uniqueid="%s"]' : '[data-index="%s"]', index))[visible ? 'show' : 'hide']();
    };

    BootstrapTable.prototype.getVisibleFields = function () {
        var that = this,
            visibleFields = [];

        $.each(this.header.fields, function (j, field) {
            var column = that.columns[getFieldIndex(that.columns, field)];

            if (!column.visible) {
                return;
            }
            visibleFields.push(field);
        });
        return visibleFields;
    };

    // PUBLIC FUNCTION DEFINITION
    // =======================

    BootstrapTable.prototype.resetView = function (params) {
        var padding = 0;

        if (params && params.height) {
            this.options.height = params.height;
        }

        this.$selectAll.prop('checked', this.$selectItem.length > 0 &&
            this.$selectItem.length === this.$selectItem.filter(':checked').length);

        if (this.options.height) {
            var toolbarHeight = getRealHeight(this.$toolbar),
                paginationHeight = getRealHeight(this.$pagination),
                height = this.options.height - toolbarHeight - paginationHeight;

            this.$tableContainer.css('height', height + 'px');
        }

        if (this.options.cardView) {
            // remove the element css
            this.$el.css('margin-top', '0');
            this.$tableContainer.css('padding-bottom', '0');
            return;
        }

        if (this.options.showHeader && this.options.height) {
            this.$tableHeader.show();
            this.resetHeader();
            padding += this.$header.outerHeight();
        } else {
            this.$tableHeader.hide();
            this.trigger('post-header');
        }

        if (this.options.showFooter) {
            this.resetFooter();
            if (this.options.height) {
                padding += this.$tableFooter.outerHeight();
            }
        }

        // Assign the correct sortable arrow
        this.getCaret();
        this.$tableContainer.css('padding-bottom', padding + 'px');
        this.trigger('reset-view');
    };

    BootstrapTable.prototype.getData = function (useCurrentPage) {
        return (this.searchText || !$.isEmptyObject(this.filterColumns) || !$.isEmptyObject(this.filterColumnsPartial)) ?
            (useCurrentPage ? this.data.slice(this.pageFrom - 1, this.pageTo) : this.data) :
            (useCurrentPage ? this.options.data.slice(this.pageFrom - 1, this.pageTo) : this.options.data);
    };

    BootstrapTable.prototype.load = function (data) {
        var fixedScroll = false;

        // #431: support pagination
        if (this.options.sidePagination === 'server') {
            this.options.totalRows = data.total;
            fixedScroll = data.fixedScroll;
            data = data.rows;
        } else if (!$.isArray(data)) { // support fixedScroll
            fixedScroll = data.fixedScroll;
            data = data.data;
        }

        this.initData(data);
        this.initSearch();
        this.initPagination();
        this.initBody(fixedScroll);
    };

    BootstrapTable.prototype.append = function (data) {
        this.initData(data, 'append');
        this.initSearch();
        this.initPagination();
        this.initBody(true);
    };

    BootstrapTable.prototype.prepend = function (data) {
        this.initData(data, 'prepend');
        this.initSearch();
        this.initPagination();
        this.initBody(true);
    };

    BootstrapTable.prototype.remove = function (params) {
        var len = this.options.data.length,
            i, row;

        if (!params.hasOwnProperty('field') || !params.hasOwnProperty('values')) {
            return;
        }

        for (i = len - 1; i >= 0; i--) {
            row = this.options.data[i];

            if (!row.hasOwnProperty(params.field)) {
                continue;
            }
            if ($.inArray(row[params.field], params.values) !== -1) {
                this.options.data.splice(i, 1);
            }
        }

        if (len === this.options.data.length) {
            return;
        }

        this.initSearch();
        this.initPagination();
        this.initBody(true);
    };

    BootstrapTable.prototype.removeAll = function () {
        if (this.options.data.length > 0) {
            this.options.data.splice(0, this.options.data.length);
            this.initSearch();
            this.initPagination();
            this.initBody(true);
        }
    };

    BootstrapTable.prototype.getRowByUniqueId = function (id) {
        var uniqueId = this.options.uniqueId,
            len = this.options.data.length,
            dataRow = undefined,
            i, row;

        for (i = len - 1; i >= 0; i--) {
            row = this.options.data[i];

            if (!row.hasOwnProperty(uniqueId)) {
                continue;
            }

            if (typeof row[uniqueId] === 'string') {
                id = id.toString();
            } else if (typeof row[uniqueId] === 'number') {
                if ((Number(row[uniqueId]) === row[uniqueId]) && (row[uniqueId] % 1 === 0)) {
                    id = parseInt(id);
                } else if ((row[uniqueId] === Number(row[uniqueId])) && (row[uniqueId] !== 0)) {
                    id = parseFloat(id);
                }
            }

            if (row[uniqueId] === id) {
                dataRow = row;
                break;
            }
        }

        return dataRow;
    };

    BootstrapTable.prototype.removeByUniqueId = function (id) {
        var len = this.options.data.length,
            row = this.getRowByUniqueId(id);

        if (row) {
            this.options.data.splice(this.options.data.indexOf(row), 1);
        }

        if (len === this.options.data.length) {
            return;
        }

        this.initSearch();
        this.initPagination();
        this.initBody(true);
    };

    BootstrapTable.prototype.insertRow = function (params) {
        if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
            return;
        }
        this.data.splice(params.index, 0, params.row);
        this.initSearch();
        this.initPagination();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.updateRow = function (params) {
        if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
            return;
        }
        $.extend(this.data[params.index], params.row);
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.showRow = function (params) {
        if (!params.hasOwnProperty('index')) {
            return;
        }

        this.toggleRow(params.index, params.isIdField === undefined ? false : true, true);
    };

    BootstrapTable.prototype.hideRow = function (params) {
        if (!params.hasOwnProperty('index')) {
            return;
        }

        this.toggleRow(params.index, params.isIdField === undefined ? false : true, false);
    };

    BootstrapTable.prototype.getRowsHidden = function (show) {
        var rows = $(this.$body[0]).children().filter(':hidden'),
            i = 0;
        if (show) {
            for (; i < rows.length; i++) {
                $(rows[i]).show();
            }
        }
        return rows;
    };

    BootstrapTable.prototype.mergeCells = function (options) {
        var row = options.index,
            col = $.inArray(options.field, this.getVisibleFields()),
            rowspan = options.rowspan || 1,
            colspan = options.colspan || 1,
            i, j,
            $tr = this.$body.find('tr'),
            $td;

        if (this.options.detailView && !this.options.cardView) {
            col += 1;
        }

        $td = $tr.eq(row).find('td').eq(col);

        if (row < 0 || col < 0 || row >= this.data.length) {
            return;
        }

        for (i = row; i < row + rowspan; i++) {
            for (j = col; j < col + colspan; j++) {
                $tr.eq(i).find('td').eq(j).hide();
            }
        }

        $td.attr('rowspan', rowspan).attr('colspan', colspan).show();
    };

    BootstrapTable.prototype.updateCell = function (params) {
        if (!params.hasOwnProperty('rowIndex') || !params.hasOwnProperty('fieldName') || !params.hasOwnProperty('fieldValue')) {
            return;
        }
        this.data[params.rowIndex][params.fieldName] = params.fieldValue;
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.getOptions = function () {
        return this.options;
    };

    BootstrapTable.prototype.getSelections = function () {
        var that = this;

        return $.grep(this.data, function (row) {
            return row[that.header.stateField];
        });
    };

    BootstrapTable.prototype.getAllSelections = function () {
        var that = this;

        return $.grep(this.options.data, function (row) {
            return row[that.header.stateField];
        });
    };

    BootstrapTable.prototype.getAllSelectionIds = function () {
        var that = this;
        var uniqueId = this.options.uniqueId,
            row = '',
            id = '',
            ids = new Array(),
            len = this.options.data.length,
            i;

        for (i = len - 1; i >= 0; i--) {

            row = this.options.data[i];
            if (row[that.header.stateField]) {
                if (!row.hasOwnProperty(uniqueId)) {
                    continue;
                }
                id = row[uniqueId];
                if ('' !== id) {
                    ids.push(id);
                }
            }


        }
        return ids.join(",");
    };


    BootstrapTable.prototype.checkAll = function () {
        this.checkAll_(true);
    };

    BootstrapTable.prototype.uncheckAll = function () {
        this.checkAll_(false);
    };

    BootstrapTable.prototype.checkAll_ = function (checked) {
        var rows;
        if (!checked) {
            rows = this.getSelections();
        }
        this.$selectItem.filter(':enabled').prop('checked', checked);
        this.updateRows();
        this.updateSelected();
        if (checked) {
            rows = this.getSelections();
        }
        this.trigger(checked ? 'check-all' : 'uncheck-all', rows);
    };

    BootstrapTable.prototype.check = function (index) {
        this.check_(true, index);
    };

    BootstrapTable.prototype.uncheck = function (index) {
        this.check_(false, index);
    };

    BootstrapTable.prototype.check_ = function (checked, index) {
        this.$selectItem.filter(sprintf('[data-index="%s"]', index)).prop('checked', checked);
        this.data[index][this.header.stateField] = checked;
        this.updateSelected();
        this.trigger(checked ? 'check' : 'uncheck', this.data[index]);
    };

    BootstrapTable.prototype.checkBy = function (obj) {
        this.checkBy_(true, obj);
    };

    BootstrapTable.prototype.uncheckBy = function (obj) {
        this.checkBy_(false, obj);
    };

    BootstrapTable.prototype.checkBy_ = function (checked, obj) {
        if (!obj.hasOwnProperty('field') || !obj.hasOwnProperty('values')) {
            return;
        }

        var that = this,
            rows = [];
        $.each(this.options.data, function (index, row) {
            if (!row.hasOwnProperty(obj.field)) {
                return false;
            }
            if ($.inArray(row[obj.field], obj.values) !== -1) {
                that.$selectItem.filter(sprintf('[data-index="%s"]', index)).prop('checked', checked);
                row[that.header.stateField] = checked;
                rows.push(row);
                that.trigger(checked ? 'check' : 'uncheck', row);
            }
        });
        this.updateSelected();
        this.trigger(checked ? 'check-some' : 'uncheck-some', rows);
    };

    BootstrapTable.prototype.destroy = function () {
        this.$el.insertBefore(this.$container);
        $(this.options.toolbar).insertBefore(this.$el);
        this.$container.next().remove();
        this.$container.remove();
        this.$el.html(this.$el_.html())
            .css('margin-top', '0')
            .attr('class', this.$el_.attr('class') || ''); // reset the class
    };

    BootstrapTable.prototype.showLoading = function () {
        this.$tableLoading.show();
    };

    BootstrapTable.prototype.hideLoading = function () {
        this.$tableLoading.hide();
    };

    BootstrapTable.prototype.togglePagination = function () {
        this.options.pagination = !this.options.pagination;
        var button = this.$toolbar.find('button[name="paginationSwitch"] i');
        if (this.options.pagination) {
            button.attr("class", this.options.iconsPrefix + " " + this.options.icons.paginationSwitchDown);
        } else {
            button.attr("class", this.options.iconsPrefix + " " + this.options.icons.paginationSwitchUp);
        }
        this.updatePagination();
    };

    BootstrapTable.prototype.refresh = function (params) {
        if (params && params.url) {
            this.options.url = params.url;
            this.options.pageNumber = 0;
        }
        this.initServer(params && params.silent, params && params.query);
    };

    BootstrapTable.prototype.resetWidth = function () {
        if (this.options.showHeader && this.options.height) {
            this.fitHeader();
        }
        if (this.options.showFooter) {
            this.fitFooter();
        }
    };

    BootstrapTable.prototype.showColumn = function (field) {
        this.toggleColumn(getFieldIndex(this.columns, field), true, true);
    };

    BootstrapTable.prototype.hideColumn = function (field) {
        this.toggleColumn(getFieldIndex(this.columns, field), false, true);
    };

    BootstrapTable.prototype.getHiddenColumns = function () {
        return $.grep(this.columns, function (column) {
            return !column.visible;
        });
    };

    BootstrapTable.prototype.filterBy = function (columns) {
        this.filterColumns = $.isEmptyObject(columns) ? {} : columns;
        this.options.pageNumber = 1;
        this.initSearch();
        this.updatePagination();
    };

    BootstrapTable.prototype.scrollTo = function (value) {
        if (typeof value === 'string') {
            value = value === 'bottom' ? this.$tableBody[0].scrollHeight : 0;
        }
        if (typeof value === 'number') {
            this.$tableBody.scrollTop(value);
        }
        if (typeof value === 'undefined') {
            return this.$tableBody.scrollTop();
        }
    };

    BootstrapTable.prototype.getScrollPosition = function () {
        return this.scrollTo();
    };

    BootstrapTable.prototype.selectPage = function (page) {
        if (page > 0 && page <= this.options.totalPages) {
            this.options.pageNumber = page;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.prevPage = function () {
        if (this.options.pageNumber > 1) {
            this.options.pageNumber--;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.nextPage = function () {
        if (this.options.pageNumber < this.options.totalPages) {
            this.options.pageNumber++;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.toggleView = function () {
        this.options.cardView = !this.options.cardView;
        this.initHeader();
        // Fixed remove toolbar when click cardView button.
        //that.initToolbar();
        this.initBody();
        this.trigger('toggle', this.options.cardView);
    };

    BootstrapTable.prototype.refreshOptions = function (options) {
        //If the objects are equivalent then avoid the call of destroy / init methods
        if (compareObjects(this.options, options, false)) {
            return;
        }
        this.options = $.extend(this.options, options);
        this.trigger('refresh-options', this.options);
        this.destroy();
        this.init();
    };


    // BOOTSTRAP TABLE PLUGIN DEFINITION
    // =======================

    var allowedMethods = [
        'getOptions',
        'getSelections', 'getAllSelections', 'getData',
        'load', 'append', 'prepend', 'remove', 'removeAll',
        'insertRow', 'updateRow', 'updateCell', 'removeByUniqueId',
        'getRowByUniqueId', 'showRow', 'hideRow', 'getRowsHidden',
        'mergeCells',
        'checkAll', 'uncheckAll',
        'check', 'uncheck',
        'checkBy', 'uncheckBy',
        'refresh',
        'resetView',
        'resetWidth',
        'destroy',
        'showLoading', 'hideLoading',
        'showColumn', 'hideColumn', 'getHiddenColumns',
        'filterBy',
        'scrollTo',
        'getScrollPosition',
        'selectPage', 'prevPage', 'nextPage',
        'togglePagination',
        'toggleView',
        'refreshOptions'
    ];

    $.fn.bootstrapTable = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var $this = $(this),
                data = $this.data('bootstrap.table'),
                options = $.extend({}, BootstrapTable.DEFAULTS, $this.data(),
                    typeof option === 'object' && option);

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw new Error("Unknown method: " + option);
                }

                if (!data) {
                    return;
                }

                value = data[option].apply(data, args);

                if (option === 'destroy') {
                    $this.removeData('bootstrap.table');
                }
            }

            if (!data) {
                $this.data('bootstrap.table', (data = new BootstrapTable(this, options)));
            }
        });

        return typeof value === 'undefined' ? this : value;
    };

    $.fn.bootstrapTable.Constructor = BootstrapTable;
    $.fn.bootstrapTable.defaults = BootstrapTable.DEFAULTS;
    $.fn.bootstrapTable.columnDefaults = BootstrapTable.COLUMN_DEFAULTS;
    $.fn.bootstrapTable.locales = BootstrapTable.LOCALES;
    $.fn.bootstrapTable.methods = allowedMethods;

    // BOOTSTRAP TABLE INIT
    // =======================

    $(function () {
        $('[data-toggle="table"]').bootstrapTable();
    });

    document.onkeydown = function (e) {
        var ev = document.all ? window.event : e;
        if (ev.keyCode == 13) {
            $("#zzos_search_btn").click();
            $("#adv_search_div").hide();
        }
        if (ev.keyCode == 116) {
            sessionStorage.removeItem(pageName() + "_search");

            sessionStorage.removeItem(pageName() + "_pageNumber");
            sessionStorage.removeItem(pageName() + "_pageSize");

            window.location.reload();
        }
    }

}(jQuery);
document.onclick = function (e) {
    if (typeof (event.srcElement) == 'undefined') {
        var target = event.target;
    } else {
        var target = event.srcElement;
    }
    e = window.event || e; // 兼容IE7
    obj = $(e.srcElement || e.target);
    // 点击区域位于当前节点
    if (obj.attr('class') != 'xlcd_mod' && obj.attr('data-toggle') != 'dropdown') {
        if (!$('.xlcd_mod').is(":hidden")) {
            $('.xlcd_mod').hide();
        }
    }

//    if (obj.attr('id') != 'zzos_adv_search_btn' && obj.attr("id") != 'adv_search_div' && obj.attr('class') && obj.attr('class').indexOf('adv_search_item')<0) {
//        if(!$('#adv_search_div').is(":hidden")){
//            $('#adv_search_div').hide();
//        }
//    }


    if (!isParent(target, $("#adv_search_div")[0]) && $(target).attr("id") != 'zzos_adv_search_btn' && !$(obj).hasClass('adv_tag') && !isHasClass(obj, "adv_tag")) {
        if ($(obj).attr("class") != undefined) {
            $('#adv_search_div').hide();
        }
    }

    if (!isParent(target, $("#ck_box_menu")[0]) && $(target).attr("id") != 'selectAllBtn') {
        $('#ck_box_menu').hide();
    }
};

//判断一个元素是否是另一个元素的子元素的方法
function isParent(object, parentObj) {
    while (object != undefined && object != null && object.tagName.toUpperCase() != 'BODY') {
        if (object == parentObj) {
            return true;
        }
        object = object.parentNode;
    }
    return false;
}

function isHasClass(object, className) {
    var existsClass = false;
    while (object != undefined && object != null && $(object)[0] != null && $(object)[0].tagName != undefined && $(object)[0].tagName != 'BODY') {
        if ($(object).hasClass(className) || $(object).hasClass("jqx-listbox")) {
            existsClass = true;
            break;
        } else {
            object = $(object).parent();
        }
    }
    return existsClass;
}

function closeRegionDiv() {
    $("#adv_search_div").hide();
}
