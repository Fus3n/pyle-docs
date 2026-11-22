#include <emscripten/bind.h>
#include <cstdlib>
#include <iostream>
#include <string>

#include "pyle/config.hpp"
#include "pyle/pyle.hpp"
#include "pyle/binder.hpp"
#include "pyle/std/std_core.hpp"

extern "C" int pyle_input(const char* prompt, int prompt_len, char* out, int cap);

using namespace pyle;

namespace {

Value native_input(VM& vm, ArgView args) {
    if (args.size() > 1) {
        vm.runtime_error(RuntimeError::ArgumentError, "input() takes at most 1 argument (optional prompt).");
        return Value();
    }

    std::string prompt = args.size() == 1 ? vm.value_to_string(args[0]) : "";
    if (!prompt.empty()) std::cout << prompt << std::flush;

    char* buffer = static_cast<char*>(std::malloc(4096));
    if (buffer == nullptr) {
        vm.runtime_error(RuntimeError::Runtime, "input() could not allocate a buffer.");
        return Value();
    }

    int length = pyle_input(prompt.c_str(), static_cast<int>(prompt.size()), buffer, 4096);
    if (length < 0) {
        std::free(buffer);
        vm.runtime_error(RuntimeError::Runtime, "input() could not read a line.");
        return Value();
    }

    std::string line(buffer, static_cast<size_t>(length));
    std::free(buffer);
    return Value(Value::Tag::StringRef, vm.intern_string(line));
}

bool run_source(const std::string& source) {
    pyle::Pyle interpreter;
    pyle::register_core_natives(interpreter.vm);
    pyle::bind_function<native_input>(interpreter.vm, "input");
    bool compiled = interpreter.execute(source, false, "playground.pyl");
    return compiled && !interpreter.vm.is_panicked();
}

std::string language_version() {
    return std::string(PYLE_VERSION);
}

} // namespace

EMSCRIPTEN_BINDINGS(pyle_playground) {
    emscripten::function("run", &run_source);
    emscripten::function("version", &language_version);
}
