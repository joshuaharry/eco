package find

// A Request provides the information required to find a library on the
// internet and download it.
type Request struct {
	// ID represents the name of the library.
	ID string
	// Language describes the ecosystem in which the library sits.
	Language string
}
