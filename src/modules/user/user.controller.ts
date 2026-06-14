const createUserIntoDB = async(  )=>{
      const {name, email, password, role} = req.body

  const result = await Pool.query(`
    INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
    `, [name, email, password, role])

    console.log(result)
}