cmake_minimum_required(VERSION 3.20)
project(pyle_playground LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "Configure this project with emcmake.")
endif()

set(PYLE_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../vendor/pyle" CACHE PATH "Path to the pyle repository")
set(PYLE_WASM_ENV "web,worker" CACHE STRING "Emscripten ENVIRONMENT value")

if(NOT EXISTS "${PYLE_SOURCE_DIR}/libpyle/CMakeLists.txt")
    message(FATAL_ERROR "libpyle not found at ${PYLE_SOURCE_DIR}. Run git submodule update --init --depth 1.")
endif()

add_subdirectory("${PYLE_SOURCE_DIR}/libpyle" libpyle)

add_executable(pyle_wasm glue.cpp)
target_link_libraries(pyle_wasm PRIVATE libpyle)

target_compile_options(pyle_wasm PRIVATE -fwasm-exceptions)
target_link_options(pyle_wasm PRIVATE
    -fwasm-exceptions
    --no-entry
    -lembind
    --js-library ${CMAKE_CURRENT_SOURCE_DIR}/async_input.js
    -sMODULARIZE=1
    -sEXPORT_ES6=1
    -sEXPORT_NAME=createPyleModule
    -sENVIRONMENT=${PYLE_WASM_ENV}
    -sALLOW_MEMORY_GROWTH=1
    -sINITIAL_MEMORY=67108864
    -sSTACK_SIZE=2097152
    -sASYNCIFY_STACK_SIZE=65536
    -sFILESYSTEM=1
    -sEXIT_RUNTIME=0
    -sASSERTIONS=0
    # input() suspends the WASM stack until the page delivers a line.
    # ASYNCIFY and wasm exceptions overlap in a few functions; the tests
    # exercise input() at the top level, inside pcall, and inside async.run.
    -sASYNCIFY=1
)

set_target_properties(pyle_wasm PROPERTIES
    OUTPUT_NAME "pyle_wasm"
    SUFFIX ".js"
)
