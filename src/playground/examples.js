export const examples = [
	{
		id: 'hello',
		label: 'Hello, world',
		code: `# Every Pyle script starts here.
print("Hello from WebAssembly.")

let version: string = PYLE_VERSION
printf("Running Pyle {}", version)`,
	},
	{
		id: 'fib',
		label: 'Fibonacci',
		code: `fn fib(n: int): int {
    if n <= 1 { return n }
    return fib(n - 1) + fib(n - 2)
}

for i in 1..11 {
    printf("fib({}) = {}", i, fib(i))
}`,
	},
	{
		id: 'structs',
		label: 'Structs',
		code: `struct Stack(items: array) {
    fn push(v) => self.items.append(v)
    fn pop() => self.items.pop()
    fn size(): int => self.items.size()
}

let s = Stack(items: [])
s.push(1)
s.push(2)
s.push(3)

printf("size = {}", s.size())
printf("{} then {}", s.pop(), s.pop())`,
	},
	{
		id: 'closures',
		label: 'Closures',
		code: `fn make_counter(): function {
    let count = 0
    return fn() {
        count += 1
        return count
    }
}

let next = make_counter()
print(next())
print(next())
print(next())`,
	},
	{
		id: 'collections',
		label: 'Arrays & maps',
		code: `let nums = [1, 2, 3, 4, 5]
let doubled = nums.map(fn(n) => n * 2)
let evens = doubled.filter(fn(n) => n % 4 == 0)

print(doubled)
print(evens)

let person = {name: "Ada", language: "Pyle"}
person.age = 36
printf("{} writes {}", person.name, person.language)

for key in person.keys() {
    printf("{} = {}", key, person[key])
}`,
	},
	{
		id: 'async',
		label: 'Async',
		code: `let os = import("os")

fn task(name: string, ms: int) {
    printf("{} started", name)
    waitfor(os.sleep_async(ms))
    printf("{} finished", name)
}

fn main() {
    async.all([
        fn() { task("alpha", 30) },
        fn() { task("beta", 10) },
        fn() { task("gamma", 20) }
    ])
}

async.run(main)`,
	},
	{
		id: 'errors',
		label: 'Error handling',
		code: `fn divide(a: int, b: int): int {
    assert(b != 0, "cannot divide by zero")
    return a / b
}

let result = pcall(divide, 10, 0)

if result.ok {
    print(result.value)
} else {
    printf("caught {}: {}", result.error.type, result.error.message)
}`,
	},
	{
		id: 'math',
		label: 'Math module',
		code: `let math = import("math")

printf("sqrt(144) = {}", math.sqrt(144))
printf("pi = {:.4f}", math.PI)
printf("floor(3.9) = {}", math.floor(3.9))

let values = [2.4, 7.8, 1.2, 9.5]
print(values.map(fn(v) => math.round(v)))`,
	},
	{
		id: 'input',
		label: 'Input',
		code: `let name = input("What is your name? ")
printf("Hello, {}!", name)

let count = tonum(input("How many? "))
for i in 1..count + 1 {
    printf("{}", i)
}`,
	},
	{
		id: 'strings',
		label: 'Strings',
		code: `let s = "  Hello, Pyle  "

print(s.trim())
print(s.trim().upper())
print("a,b,c".split(","))
print("-".join([1, 2, 3]))
print("abc".slice(1, 3))
print("hello".replace("l", "L"))
print("hello".starts_with("he"))
print("hello"[0])`,
	},
	{
		id: 'enums',
		label: 'Enums',
		code: `enum Direction { NORTH, SOUTH, EAST, WEST }
enum Status { OK, ERROR = 5, TIMEOUT }

printf("{} {} {}", Direction.NORTH, Direction["SOUTH"], Direction.WEST)
printf("{} {} {}", Status.OK, Status.ERROR, Status.TIMEOUT)

for name in Direction.keys() {
    printf("{} = {}", name, Direction[name])
}`,
	},
	{
		id: 'coroutines',
		label: 'Coroutines',
		code: `let gen = Coro(fn() {
    let received = yield "first"
    print("got " + received)
    yield "second"
    return "done"
})

print(gen.resume())
print(gen.resume("hello"))
print(gen.resume())
print(gen.state())`,
	},
	{
		id: 'futures',
		label: 'Futures',
		code: `let os = import("os")

let f = Future()
printf("done={} failed={}", f.is_done, f.has_failed)

f.resolve(42)
printf("done={} data={}", f.is_done, f.data)

fn work() {
    waitfor(os.sleep_async(50))
    return "woke up"
}

print(async.run(work))`,
	},
	{
		id: 'bytes',
		label: 'Bytes',
		code: `let b = Bytes([72, 101, 108, 108, 111])

print(b.size())
print(b[0])
print(b.to_string())

let builder = BytesBuilder()
builder.push(72)
builder.extend_array([101, 108, 108, 111])

let hello = builder.to_bytes()
print(hello.to_string())
print(builder.size())`,
	},
	{
		id: 'files',
		label: 'Files',
		code: `let fs = import("fs")
let path = import("path")

fs.mkdir("demo")
fs.write_file(path.join("demo", "a.txt"), "hello\\n")
fs.append_file("demo/a.txt", "world\\n")

print(fs.read_file("demo/a.txt"))
print(fs.file_size("demo/a.txt"))
print(fs.listdir("demo"))
print(fs.walk("demo"))`,
	},
	{
		id: 'formatting',
		label: 'Formatting',
		code: `printf("{:.2f}", 3.14159)
printf("{:05d}", 42)
printf("{:x}", 255)
printf("{:>10}", "right")
printf("{1} {0}", "a", "b")
printf("{{{}}}", 42)

print("")
printf("{:>8} | {:>12}", "spec", "output")
printf("{:-<8}-+-{:-<12}", "", "")
printf("{:>8} | {:>12.2f}", "{:.2f}", 3.14159)
printf("{:>8} | {:>12d}", "{:d}", 42)
printf("{:>8} | {:>12x}", "{:x}", 255)
printf("{:>8} | {:>12b}", "{:b}", 5)
printf("{:>8} | {:>12c}", "{:c}", 65)`,
	},
];

export const defaultExample = examples[1];
