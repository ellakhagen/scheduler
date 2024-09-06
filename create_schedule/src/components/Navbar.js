import {Box} from '@chakra-ui/react'
import { createIcon } from '@chakra-ui/icons'
import {Link, useLocation} from 'react-router-dom';

export const HomeIcon = createIcon({
    displayName: 'HomeIcon',
    viewBox: '0 0 20 20',
    path: (
        <path fill='white'
        d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z'/>
    )
})

function Navbar(){
    const location = useLocation();
    
    return(
        <Box>
            {location.pathname !== '/' ? 
            <Box position='relative' w='100vw' top='0px' h='75px'  bg='#bdc9c0' p='15px' pl='25px'>
                <Link to="/home">
                    <HomeIcon boxSize='40px'/>
                </Link>
            </Box> : <></>
            }
        </Box>
    )
}
export default Navbar