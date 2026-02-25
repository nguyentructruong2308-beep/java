import Swal from 'sweetalert2';

/**
 * Custom Swal helper for premium look and feel
 */
const confirmSwal = (title, text, icon = 'warning') => {
    return Swal.fire({
        title: title || 'Bạn có chắc chắn?',
        html: `<div class="premium-swal-html" style="font-family: 'Inter', sans-serif; color: #666;">${text || ''}</div>`,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: 'ĐỒNG Ý',
        cancelButtonText: 'HỦY',
        customClass: {
            container: 'premium-swal-container',
            popup: 'premium-swal-popup',
            title: 'premium-swal-title',
            confirmButton: 'premium-swal-confirm',
            cancelButton: 'premium-swal-cancel',
            icon: 'premium-swal-icon'
        },
        buttonsStyling: false,
        heightAuto: false,
        background: '#fff'
    });
};

const successSwal = (title, text) => {
    return Swal.fire({
        title: title || 'Thành công!',
        html: `<div style="color: #666; font-size: 14px;">${text || ''}</div>`,
        icon: 'success',
        confirmButtonText: 'TUYỆT VỜI',
        customClass: {
            popup: 'premium-swal-popup',
            confirmButton: 'premium-swal-confirm-success'
        },
        buttonsStyling: false,
        heightAuto: false
    });
};

const errorSwal = (title, text, htmlContent) => {
    return Swal.fire({
        title: title || 'Đã có lỗi xảy ra!',
        html: htmlContent || `<div style="color: #666; font-size: 14px;">${text || ''}</div>`,
        icon: 'error',
        confirmButtonText: 'ĐÓNG',
        customClass: {
            popup: 'premium-swal-popup',
            confirmButton: 'premium-swal-confirm-error'
        },
        buttonsStyling: false,
        heightAuto: false
    });
};

const toastSwal = (title, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: title
    });
};

export { confirmSwal, successSwal, errorSwal, toastSwal };
