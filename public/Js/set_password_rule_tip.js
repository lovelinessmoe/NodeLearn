$(document).ready(function () {

    $(".password_rule_tip").on('input', function () {
        var value = $(this).val();
        var target = $(this);

        $(target).tipso({
            position: 'tipso-right',
            background: '#f5f5f5',
            width: 230,
            color: '#222222'
        });
        $.ajax({
            type: 'post',
            url: GET_PASSWORD_RULE_TIP,
            data: {'password': value},
            dataType: 'html',
            success: function (data) {
                $(target).tipso('update', 'content', data);
                $(target).tipso('show');
            }
        });


    });

})
