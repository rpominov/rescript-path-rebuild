type node = Sep | Range(int, int) | Literal(string)
type status = L(string) | S(string) | I(string) | D(string) | R(string, string)

@module("path") external osPathSep: string = "sep"
@module("path") external isAbsolute: string => bool = "isAbsolute"
@module("path") external extname: string => string = "extname"

@val external int: string => float = "Number"
let int = str => {
  let result = int(str)
  let result' = result->Belt.Int.fromFloat
  result === result'->Belt.Int.toFloat ? Some(result') : None
}

@send external append: (array<'a>, 'a) => array<'a> = "concat"
@send external repeat: (string, int) => string = "repeat"

let commit = (result, status) => {
  switch status {
  | L("") => result->Ok
  | L(s) => result->append(Literal(s))->Ok
  | I(n) =>
    switch n->int {
    | Some(n') => result->append(Range(n', n'))->Ok
    | None => Error(`Bad range limit: ${n}`)
    }
  | R(n, m) =>
    switch n->int {
    | Some(n') =>
      switch m->int {
      | Some(m') =>
        // 1..2 -> ok
        // 1..-1 -> ok
        // 2..1 -> err
        // -2..-1 -> ok
        // -1..1 -> err
        // -1..-2 -> err
        if n' >= 0 ? m' >= 0 && m' < n' : m' >= 0 || n' > m' {
          Error(`Bad range limits: ${n}..${m}`)
        } else {
          result->append(Range(n', m'))->Ok
        }
      | None => Error(`Bad range limit: ${m}`)
      }
    | None => Error(`Bad range limit: ${n}`)
    }
  | S(_) => Js.Exn.raiseError("Cannot commit a Skip")
  | D(_) => Js.Exn.raiseError("Cannot commit a Dot")
  }
}

let printError = (str, i, msg) => Error(`${str}\n${" "->repeat(i)}^\n${msg}`)

let rec parse = (str, i, mStatus, mResult: result<array<node>, string>) => {
  switch mResult {
  | Error(s) => printError(str, i - 1, s)
  | Ok(result) =>
    switch mStatus {
    | None => Ok(result)
    | Some(status) => {
        let ch = str->Js.String2.charAt(i)
        let i' = i + 1
        switch (ch, status) {
        | ("", L(_)) => parse(str, i', None, result->commit(status))
        | ("", S(_)) =>
          printError(
            str,
            i,
            "Unexpected end of string. Expected a character after the escape symbol",
          )
        | ("", _) =>
          printError(str, i, "Unexpected end of string. Did you forget to close a range?")
        | ("\\", L(s)) => parse(str, i', S(s)->Some, mResult)
        | (_, S(s)) => parse(str, i', L(s ++ ch)->Some, mResult)
        | ("\\", _) => printError(str, i, "Unexpected escape symbol inside a range")
        | ("{", L(_)) => parse(str, i', I("")->Some, result->commit(status))
        | ("{", _) => printError(str, i, "Unexpected { symbol inside a range")
        | ("}", I(_))
        | ("}", R(_, _)) =>
          parse(str, i', L("")->Some, result->commit(status))
        | ("}", _) => printError(str, i, "Unexpected } symbol")
        | (".", I(n)) => parse(str, i', D(n)->Some, mResult)
        | (".", D(n)) => parse(str, i', R(n, "")->Some, mResult)
        | (x, D(_)) => printError(str, i, `Unexpected character: ${x}. Was expecting a . symbol`)
        | (".", R(_, _)) => printError(str, i, "Unexpected . symbol")
        | ("/", L(_)) =>
          parse(
            str,
            i',
            L("")->Some,
            switch result->commit(status) {
            | Ok(r) => r->append(Sep)->Ok
            | Error(m) => Error(m)
            },
          )
        | ("/", _) => printError(str, i, "Unexpected / symbol inside a range")
        | (_, L(s)) => parse(str, i', L(s ++ ch)->Some, mResult)
        | (_, I(n)) => parse(str, i', I(n ++ ch)->Some, mResult)
        | (_, R(n, m)) => parse(str, i', R(n, m ++ ch)->Some, mResult)
        }
      }
    }
  }
}
let parse = str => parse(str, 0, Some(L("")), Ok([]))

let printRange = (parts, min, max, sep) => {
  let rec helper = st => {
    let i = min + st
    i === max
      ? parts[i]
      : parts[i] ++ (i === parts->Js.Array2.length - 2 ? "" : sep) ++ helper(st + 1)
  }
  helper(0)
}

let print = (~sep=osPathSep, nodes, path): result<string, string> => {
  if path->isAbsolute {
    Error("An absolute path cannot be used as a source path")
  } else {
    let ext = path->extname
    let withoutExt =
      path->Js.String2.substring(~from=0, ~to_=path->Js.String2.length - ext->Js.String2.length)
    let parts = withoutExt->Js.String2.split(sep)->append(ext)
    let len = parts->Js.Array2.length

    let norm = nodes->Js.Array2.map(node =>
      switch node {
      | Range(min, max) => {
          let min = Js.Math.max_int(0, min < 0 ? len + min : min)
          let max = Js.Math.min_int(len - 1, max < 0 ? len + max : max)
          max < min ? None : Range(min, max)->Some
        }
      | n => n->Some
      }
    )

    norm
    ->Js.Array2.mapi((node, i) =>
      switch node {
      | None => []
      | Some(Sep) => i > 0 && norm[i - 1] === None ? [] : [Sep]
      | Some(x) => [x]
      }
    )
    ->Js.Array2.concatMany([], _)
    ->Js.Array2.map(node =>
      switch node {
      | Literal(s) => s
      | Sep => sep
      | Range(min, max) => printRange(parts, min, max, sep)
      }
    )
    ->Js.Array2.joinWith("")
    ->Ok
  }
}

let make = str =>
  switch parse(str) {
  | Ok(nodes) => Ok((~sep=?, path) => print(~sep?, nodes, path))
  | Error(m) => Error(m)
  }

// exception ParseError({message: string})
// exception PrintError({message: string})

// let parseExn = str =>
//   switch parse(str) {
//   | Ok(x) => x
//   | Error(m) => raise(ParseError({message: m}))
//   }

// let printExn = (~sep=?, nodes, path) => {
//   switch print(~sep?, nodes, path) {
//   | Ok(x) => x
//   | Error(m) => raise(PrintError({message: m}))
//   }
// }
