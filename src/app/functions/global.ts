// Función global de validación
function validarEntrada(tipo: 'gmail' | 'telefono' | 'texto', valor: string): boolean {
    switch (tipo) {
        case 'gmail':
            // Valida un correo de Gmail
            const regexGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            return regexGmail.test(valor);

        case 'telefono':
            // Valida un número de teléfono (por ejemplo, formato 9 dígitos en Perú)
            const regexTelefono = /^[0-9]{9}$/;
            return regexTelefono.test(valor);

        case 'texto':
            // Valida texto con letras mayúsculas y minúsculas, sin caracteres especiales
            const regexTexto = /^[a-zA-Z]+$/;
            return regexTexto.test(valor);

        default:
            return false;
    }
}

// Ejemplos de uso:
console.log(validarEntrada('gmail', 'usuario@gmail.com')); // true
console.log(validarEntrada('telefono', '987654321')); // true
console.log(validarEntrada('texto', 'TextoValido')); // true
console.log(validarEntrada('texto', 'Texto!Invalido')); // false
